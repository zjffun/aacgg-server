export class CreateUserDto {
  readonly login?: string;
  readonly password?: string;
  readonly role?: string;
  readonly name?: string;
  readonly avatarUrl?: string;
  readonly avatarImg?: string;
  readonly email?: string;
  readonly githubId?: string;
}
