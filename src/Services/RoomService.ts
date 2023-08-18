import DeviceInfo from 'react-native-device-info';
import firestore from '@react-native-firebase/firestore';
import {Collections} from '../../Constants/Collections';
import {Room} from '../Models/Room';
import {UserRoom} from '../Models/UserRoom';
import {ActiveUser} from './AuthService';
export class RoomService {
  async CreateRoom(title: string) {
    const user = ActiveUser.GetActiveUser();
    console.log(user);
    if (user != undefined) {
      console.log('icerde');
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
      let qSnapChat = await await firestore()
        .collection(Collections.Rooms)
        .where('CreatedUserId', '==', user.user.id)
        .get()
        .then(querySnapshot => {
          querySnapshot.docs.forEach(each => {
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
        })
        .catch(e => {
          console.log('Oda bulunamadi.');
        });
      console.log('olusturulan odalar cekildi');
      console.log('davet ile katilinan odalar getiriliyor');
      await firestore()
        .collection(Collections.UserRooms)
        .where('UserId', '==', user.user.id)
        .get()
        .then(querySnapshot => {
          querySnapshot.docs.forEach(async each => {
            let roomId = each.data().RoomId;
            console.log(roomId);
            await firestore()
              .collection(Collections.Rooms)
              // Filter results
              .where('Id', '==', roomId)
              .get()
              .then(querySnapshot => {
                console.log('baskasi kurdu oda here');
                console.log(querySnapshot.docs);
                querySnapshot.docs.forEach(each => {
                  var room = new Room(
                    each.data().CreatedUserId,
                    each.data().CreatedUserEmail,
                    each.data().Title,
                  );
                  console.log(room);
                  room.CreatedAt = each.data().CreatedAt;
                  room.Id = each.data().Id;
                  room.UpdatedAt = each.data().UpdatedAt;
                  result.push(room);
                });
              })
              .catch(e => {
                console.log('Oda bulunamadi.');
              });
          });
        })
        .catch(e => {
          console.log('Oda bulunamadi.');
        });
      console.log('result');
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
