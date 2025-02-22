import { IPostContent } from 'src/types';

export interface IPostDto {
  readonly id?: string;
  readonly contents?: IPostContent[];
}
