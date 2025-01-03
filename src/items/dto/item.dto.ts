import { ItemType } from 'src/types';

export interface IItemDto {
  readonly id?: string;
  readonly type?: ItemType;
  readonly name?: string;
  readonly coverImage?: string;
  readonly desc?: string;
  readonly episodes?: {
    id: string;
    name: string;
  }[];
  readonly chapters?: {
    id: string;
    name: string;
  }[];
}
