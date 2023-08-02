import {BaseEntity} from './BaseEntity';

export class UserRoom extends BaseEntity {
  RoomId: string;
  UserId: string;
  constructor(roomId: string, userId: string) {
    super();
    this.RoomId = roomId;
    this.UserId = userId;
  }
}
