export enum ContentType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
}

export interface IPostContent {
  type: ContentType;
  content: string;
}

export interface IPageInfo {
  page: number;
  pageSize: number;
  skip: number;
  limit: number;
}
