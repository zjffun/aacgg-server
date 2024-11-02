export enum PostType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
}

export interface IPostContent {
  type: PostType;
  content: string;
}

export interface IPageInfo {
  page: number;
  pageSize: number;
  skip: number;
  limit: number;
}
