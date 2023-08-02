import uuid from 'react-native-uuid';

export class BaseEntity {
  Id: string = uuid.v4().toString();
  CreatedAt: Date = new Date();
  UpdatedAt: Date | undefined;
}
