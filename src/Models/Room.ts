import {BaseEntity} from './BaseEntity';

export class Room extends BaseEntity {
  CreatedUserId: string;
  Title: string;
  CreatedUserEmail: string;
  UserCount: number;
  IsLocked: boolean = false;
  LockedBy: string = '';
  constructor(CreatedUserId: string, CreatedUserEmail: string, Title: string) {
    super();
    (this.CreatedUserId = CreatedUserId), (this.Title = Title);
    this.CreatedUserEmail = CreatedUserEmail;
    this.UserCount = 1;
  }
}
