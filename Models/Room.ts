import {BaseEntity} from './BaseEntity';

export class Room extends BaseEntity {
  CreatedUserId: string;
  Title: string;

  constructor(CreatedUserId: string, Title: string) {
    super();
    (this.CreatedUserId = CreatedUserId), (this.Title = Title);
  }
}
