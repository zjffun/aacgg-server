import { ItemType } from 'src/types';

export interface IItemDto {
  readonly type?: ItemType;
  readonly name?: string;
  readonly desc?: string;
}
