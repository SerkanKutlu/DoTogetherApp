import DeviceInfo from 'react-native-device-info';
import firestore from '@react-native-firebase/firestore';
import {Collections} from '../Constants/Collections';
import {Room} from '../Models/Room';
import {UserRoom} from '../Models/UserRoom';
import {ActiveUser} from './AuthService';
import {firebase} from '@react-native-firebase/auth';
import {create} from 'react-test-renderer';
import {Sockets} from '../Constants/Sockets';
import uuid from 'react-native-uuid';
export class RoomService {
  async CreateRoom(title: string) {
    const user = ActiveUser.GetActiveUser();
    if (user != undefined) {
      let newRoom = new Room(user.user.id, user.user.email, title, '');
      await firestore()
        .collection(Collections.Rooms)
        .doc(newRoom.Id)
        .set(newRoom)
        .then(() => {
          console.log('Room Created At Firebase');
        })
        .catch(e => {
          console.log('Oda oluşturulurken Hata Oluştu');
        });
    }
  }
  async GetUserRooms(): Promise<Room[] | void> {
    var user = ActiveUser.GetActiveUser();
    if (user != undefined) {
      var result = new Array<Room>();
      try {
        const createdRoomsSnapChat = await firestore()
          .collection(Collections.Rooms)
          .where('CreatedUserId', '==', user.user.id)
          .get();
        createdRoomsSnapChat.docs.forEach(each => {
          var room = new Room(
            each.data().CreatedUserId,
            each.data().CreatedUserEmail,
            each.data().Title,
            each.data().LockedBy,
          );
          room.CreatedAt = each.data().CreatedAt;
          room.Id = each.data().Id;
          room.UpdatedAt = each.data().UpdatedAt;
          room.LockedBy = each.data().LockedBy;
          result.push(room);
        });
        let invitedRoomIds: string[] = [];
        const userRoomsSnapshot = await firestore()
          .collection(Collections.UserRooms)
          .where('UserId', '==', user.user.id)
          .get();
        userRoomsSnapshot.docs.forEach(async each => {
          invitedRoomIds.push(each.data().RoomId);
        });
        for (let i = 0; i < invitedRoomIds.length; i++) {
          const invitedRoomSnapshot = await firestore()
            .collection(Collections.Rooms)
            .where('Id', '==', invitedRoomIds[i])
            .get();
          invitedRoomSnapshot.docs.forEach(each => {
            var room = new Room(
              each.data().CreatedUserId,
              each.data().CreatedUserEmail,
              each.data().Title,
              each.data().LockedBy,
            );
            room.CreatedAt = each.data().CreatedAt;
            room.Id = each.data().Id;
            room.UpdatedAt = each.data().UpdatedAt;
            room.LockedBy = each.data().LockedBy;
            result.push(room);
          });
        }
        return result;
      } catch (e) {
        console.log('Odalar çekilirken hata oluştu: ' + e);
      }
    }
  }
  async GetRoomById(roomId: string): Promise<Room | undefined> {
    try {
      const createdRoomsSnapChat = await firestore()
        .collection(Collections.Rooms)
        .where('Id', '==', roomId)
        .get();
      for (let i = 0; i < createdRoomsSnapChat.docs.length; i++) {
        var room = new Room(
          createdRoomsSnapChat.docs[i].data().CreatedUserId,
          createdRoomsSnapChat.docs[i].data().CreatedUserEmail,
          createdRoomsSnapChat.docs[i].data().Title,
          createdRoomsSnapChat.docs[i].data().LockedBy,
        );
        room.CreatedAt = createdRoomsSnapChat.docs[i].data().CreatedAt;
        room.Id = createdRoomsSnapChat.docs[i].data().Id;
        room.UpdatedAt = createdRoomsSnapChat.docs[i].data().UpdatedAt;
        return room;
      }
    } catch (error) {
      console.log(error);
      throw 'Oda bulunamadıabc';
    }
  }
  async JoinRoom(roomId: string) {
    var user = ActiveUser.GetActiveUser();
    if (user != undefined) {
      let newUserRoom = new UserRoom(roomId, user.user.id, user.user.email);
      await firestore()
        .collection(Collections.UserRooms)
        .doc(newUserRoom.Id)
        .set(newUserRoom)
        .then(() => {
          console.log('RoomUser Created At Firebase');
        })
        .catch(e => {
          throw new Error('Odaya Katılırken Hata Oluştu.');
        });
    }
  }
  async DeleteUserFromRoomUser(roomId: string, userId: string) {
    console.log('user will deleted');
    console.log(roomId);
    console.log(userId);
    const userRoomsSnapshot = await firestore()
      .collection(Collections.UserRooms)
      .where('UserId', '==', userId)
      .get();
    userRoomsSnapshot.docs.forEach(async each => {
      if (each.data().RoomId == roomId) {
        let deleteId = each.data().Id;
        console.log(deleteId);
        await firestore()
          .collection(Collections.UserRooms)
          .doc(deleteId)
          .delete();
      }
    });
  }
  async DeleteRoom(roomId: string) {
    await firestore().collection(Collections.Rooms).doc(roomId).delete();
    const userRoomsSnapshot = await firestore()
      .collection(Collections.UserRooms)
      .where('RoomId', '==', roomId)
      .get();
    userRoomsSnapshot.docs.forEach(async each => {
      if (each.data().RoomId == roomId) {
        let deleteId = each.data().Id;
        await firestore()
          .collection(Collections.UserRooms)
          .doc(deleteId)
          .delete();
      }
    });
  }

  async CreateRoomInvite(item: any) {
    await firestore()
      .collection(Collections.Invites)
      .doc(item.InviteId)
      .set(item)
      .then(() => {
        console.log('Invite Created At Firebase');
      })
      .catch(e => {
        throw new Error('Odaya Katılırken Hata Oluştu.');
      });
  }
  async GetRoomInvites(): Promise<any[] | void> {
    var user = ActiveUser.GetActiveUser();
    if (user != undefined) {
      try {
        var result = new Array<any>();
        var roomInvitesSnapShot = await firestore()
          .collection(Collections.Invites)
          .where('InvitedId', '==', user.user.id)
          .get();
        for (let i = 0; i < roomInvitesSnapShot.docs.length; i++) {
          result.push(roomInvitesSnapShot.docs[i].data());
        }
        return result;
      } catch (error) {
        console.log('invites cekilemedi' + error);
      }
    }
  }
  async DeleteRoomInvite(inviteId: string) {
    await firestore().collection(Collections.Invites).doc(inviteId).delete();
  }
  async UpdateRoomLockedBy(roomId: string, newValue: string) {
    try {
      await firestore().collection(Collections.Rooms).doc(roomId).update({
        LockedBy: newValue,
      });
    } catch (error) {
      console.log('update edilemedi');
    }
  }
  async GetRoomUsers(roomId: string): Promise<any[] | undefined> {
    var user = ActiveUser.GetActiveUser();
    if (user != undefined) {
      var result = new Array<any>();
      try {
        var userRoomsSnapchat = await firestore()
          .collection(Collections.UserRooms)
          .where('RoomId', '==', roomId)
          .get();
        userRoomsSnapchat.docs.forEach(each => {
          var roomUser = {
            UserEmail: each.data().UserEmail,
            UserId: each.data().UserId,
            Id: uuid.v4().toString(),
            IsOnline: false,
          };
          result.push(roomUser);
        });
        var room = await this.GetRoomById(roomId);
        var roomCreator = {
          Id: uuid.v4().toString(),
          UserEmail: room?.CreatedUserEmail,
          UserId: room?.CreatedUserId,
          IsOnline: false,
        };
        result.push(roomCreator);
        return result;
      } catch (e) {
        console.log('Kullanıcılar çekilirken hata oluştu: ' + e);
        return undefined;
      }
    }
  }
  TrackRoomUpdates(onResult: any, onError: any, roomId: string) {
    firestore()
      .collection(Collections.Rooms)
      .doc(roomId)
      .onSnapshot(onResult, onError);
  }
}
