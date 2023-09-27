import {BaseEntity} from './BaseEntity';

export class UserRoom extends BaseEntity {
  RoomId: string;
  UserId: string;
  UserEmail: string;
  constructor(roomId: string, userId: string, userEmail: string) {
    super();
    this.RoomId = roomId;
    this.UserId = userId;
    this.UserEmail = userEmail;
  }
}
