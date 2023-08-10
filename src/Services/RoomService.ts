import DeviceInfo from 'react-native-device-info';
import firestore from '@react-native-firebase/firestore';
import {ActiveUser} from '../../Session/ActiveUser';
import {Collections} from '../../Constants/Collections';
import {Room} from '../../Models/Room';
import {UserRoom} from '../../Models/UserRoom';
export class RoomService {
  async CreateRoom(title: string) {
    let newRoom = new Room(ActiveUser.User.Id, title);
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
  async GetUserRooms(): Promise<Room[]> {
    var result = new Array<Room>();
    return await firestore()
      .collection(Collections.Rooms)
      // Filter results
      .where('CreatedUserId', '==', ActiveUser.User.Id)
      .get()
      .then(querySnapshot => {
        querySnapshot.docs.forEach(each => {
          var room = new Room(each.data().CreatedUserId, each.data().Title);
          room.CreatedAt = each.data().CreatedAt;
          room.Id = each.data().Id;
          room.UpdatedAt = each.data().UpdatedAt;
          result.push(room);
        });
        return result;
      })
      .catch(e => {
        throw new Error('Hiç Oda Yok.');
      });
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
