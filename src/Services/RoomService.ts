import DeviceInfo from 'react-native-device-info';
import firestore from '@react-native-firebase/firestore';
import {Collections} from '../Constants/Collections';
import {Room} from '../Models/Room';
import {UserRoom} from '../Models/UserRoom';
import {ActiveUser} from './AuthService';
import {create} from 'react-test-renderer';
export class RoomService {
  async CreateRoom(title: string) {
    const user = ActiveUser.GetActiveUser();
    if (user != undefined) {
      let newRoom = new Room(user.user.id, user.user.email, title);
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
          );
          room.CreatedAt = each.data().CreatedAt;
          room.Id = each.data().Id;
          room.UpdatedAt = each.data().UpdatedAt;
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
            );
            room.CreatedAt = each.data().CreatedAt;
            room.Id = each.data().Id;
            room.UpdatedAt = each.data().UpdatedAt;
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
      console.log('undefined değil ' + roomId);
      let newUserRoom = new UserRoom(roomId, user.user.id);
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
  async LeaveRoom(roomId: string) {
    await firestore()
      .collection(Collections.UserRooms)
      .doc(roomId)
      .delete()
      .then(() => {
        console.log('Room Created At Firebase');
      })
      .catch(e => {
        throw new Error('Odadan Ayrılırken Hata Oluştu.');
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
}
