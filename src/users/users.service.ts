import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SaveOptions, Types } from 'mongoose';
import PERMISSION from 'src/enums/permission';
import ROLE from 'src/enums/role';
import { Project, ProjectDocument } from 'src/projects/schemas/projects.schema';
import { User, UserDocument } from './schemas/users.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly usersModel: Model<UserDocument>,
    @InjectModel(Project.name)
    private readonly projectsModel: Model<ProjectDocument>,
  ) {}

  async findOne(condition) {
    return this.usersModel.findOne(condition).exec();
  }

  async findById(id: string | Types.ObjectId) {
    return this.usersModel.findById(id).exec();
  }

  async getTrackItemObjectIds(userId: Types.ObjectId) {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { trackItems } = user;
    if (!Array.isArray(trackItems)) {
      return [];
    }

    return trackItems.map((item) => item.objectId);
  }

  async addTarckItem(userId: Types.ObjectId, itemId: Types.ObjectId) {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { trackItems } = user;
    if (!Array.isArray(trackItems)) {
      user.trackItems = [];
    }

    const item = trackItems.find(
      (item) => item.objectId.toString() === itemId.toString(),
    );

    if (!item) {
      user.trackItems.unshift({
        objectId: itemId,
      });

      await user.save();

      return true;
    }

    return;
  }

  async removeTarckItem(userId: Types.ObjectId, itemId: Types.ObjectId) {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { trackItems } = user;
    if (!Array.isArray(trackItems)) {
      user.trackItems = [];
    }

    user.trackItems = user.trackItems.filter((d) => {
      return d.objectId.toString() !== itemId.toString();
    });

    await user.save();

    return true;
  }

  async setWatched({
    userObjectId,
    watched,
  }: {
    userObjectId: Types.ObjectId;
    watched: User['watched'][0];
  }) {
    const user = await this.findById(userObjectId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!Array.isArray(user.watched)) {
      user.watched = [];
    }

    const itemObjectId = watched.itemObjectId;

    const item = user.watched.find(
      (item) => item.itemObjectId.toString() === itemObjectId.toString(),
    );

    if (!item) {
      user.watched.unshift(watched);
      await user.save();
      return true;
    }

    for (const d of user.watched) {
      if (d.itemObjectId.toString() === itemObjectId.toString()) {
        d.episodes = watched.episodes;
        d.chapters = watched.chapters;
      }
    }

    user.markModified('watched');

    await user.save();
    return true;
  }

  async getWatched({
    userObjectId,
    itemObjectId,
  }: {
    userObjectId: Types.ObjectId;
    itemObjectId: Types.ObjectId;
  }) {
    const user = await this.findById(userObjectId);
    if (!user) {
      throw new Error('User not found');
    }
    const { watched } = user;

    if (!Array.isArray(watched)) {
      return;
    }

    const item = watched.find(
      (item) => item.itemObjectId.toString() === itemObjectId.toString(),
    );

    return item;
  }

  async create(user: User, options: SaveOptions = {}) {
    const createdUser = await this.usersModel.create([user], options);
    return createdUser[0];
  }

  async upsert(condition, set) {
    const upsertUser = await this.usersModel.updateOne(
      condition,
      { $set: set },
      { upsert: true },
    );

    return upsertUser;
  }

  async validatePathWritePermission({
    path,
    userId,
  }: {
    path: string;
    userId: Types.ObjectId;
  }) {
    const permissionSet = await this.getPathPermissionSet({
      path,
      userId,
    });

    if (
      permissionSet.has(PERMISSION.ADMIN) ||
      permissionSet.has(PERMISSION.WRITE)
    ) {
      return true;
    }

    const user = await this.findById(userId);
    const { login } = user;

    throw new HttpException(
      `${login} doesn't have permissions for ${path}.`,
      HttpStatus.FORBIDDEN,
    );
  }

  async getPathPermissionSet({
    path,
    userId,
  }: {
    path: string;
    userId: Types.ObjectId;
  }) {
    const permissionSet = new Set<PERMISSION>();

    const user = await this.findById(userId);
    const { login, projectPermissions } = user;

    if (
      // admin has all permissions
      user.role === ROLE.ADMIN ||
      // user has permission to his own path
      path === `/${login}` ||
      path.startsWith(`/${login}/`)
    ) {
      permissionSet.add(PERMISSION.ADMIN);
      return permissionSet;
    }

    if (projectPermissions) {
      const projectIdPermissionsMap = Object.fromEntries(
        projectPermissions.map((projectPermission) => [
          projectPermission.projectId.toString(),
          projectPermission.permissions,
        ]),
      );

      const projects = await this.projectsModel
        .find(
          {
            _id: {
              $in: projectPermissions.map((p) => p.projectId),
            },
          },
          '_id path',
        )
        .lean()
        .exec();

      for (const project of projects) {
        const projectPath = project.path;
        if (path === projectPath || path.startsWith(`${projectPath}/`)) {
          const permissions = projectIdPermissionsMap[project._id.toString()];
          if (!permissions) {
            continue;
          }

          permissions.forEach((permission) => {
            permissionSet.add(permission);
          });
        }
      }
    }

    return permissionSet;
  }
}
