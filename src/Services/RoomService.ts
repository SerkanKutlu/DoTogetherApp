import DeviceInfo from 'react-native-device-info';
import firestore from '@react-native-firebase/firestore';
import {Collections} from '../Constants/Collections';
import {Room} from '../Models/Room';
import {UserRoom} from '../Models/UserRoom';
import {ActiveUser} from './AuthService';
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
  async JoinRoom(roomId: string) {
    let newUserRoom = new UserRoom(roomId, ActiveUser.User.Id);
    await firestore()
      .collection(Collections.UserRooms)
      .doc(newUserRoom.Id)
      .set(newUserRoom)
      .then(() => {
        console.log('Room Created At Firebase');
      })
      .catch(e => {
        throw new Error('Odaya Katılırken Hata Oluştu.');
      });
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
}
