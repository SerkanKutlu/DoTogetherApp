import firestore from '@react-native-firebase/firestore';
import {Collections} from '../Constants/Collections';
import uuid from 'react-native-uuid';
import {firebase} from '@react-native-firebase/auth';
import {Sockets} from '../Constants/Sockets';
export class ActivityService {
  async MakeActive(userEmail: string, roomId: string) {
    await firestore()
      .collection(Collections.Activity)
      .doc(roomId)
      .collection(Collections.ActiveUsers)
      .doc(userEmail)
      .set({
        RoomId: roomId,
        UserEmail: userEmail,
        Id: uuid.v4().toString(),
      })
      .then(() => {
        console.log('MakeActive Created or Updated At Firebase');
      })
      .catch(e => {
        throw new Error('Odaya Katılırken Hata Oluştu.');
      });
  }
  async DeleteActive(userEmail: string, roomId: string) {
    firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.Activity}/${roomId}/${userEmail.replace('.', '')}`)
      .remove();
  }
  async GetActiveUsers(roomId: string): Promise<any[] | void> {
    try {
      var result: any[] = new Array();
      const activeUsersSnapShot = await firestore()
        .collection(Collections.Activity)
        .doc(roomId)
        .collection(Collections.ActiveUsers)
        .get();
      for (let i = 0; i < activeUsersSnapShot.docs.length; i++) {
        result.push(activeUsersSnapShot.docs[i].data());
      }
      return result;
    } catch (error) {}
  }

  async ReadActivesOnce(roomId: string) {
    return await firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.Activity}/${roomId}`)
      .once('value');
  }
  async MakeActiveReal(userEmail: string, roomId: string) {
    await firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.Activity}/${roomId}/${userEmail.replace('.', '')}`)
      .set({
        RoomId: roomId,
        UserEmail: userEmail,
        Id: uuid.v4().toString(),
      })
      .then(() => {})
      .catch(e => {
        console.log('Odaya Katılırken Hata Oluştu. Real. ' + e);
      });
  }
  OnActivityChange(roomId: string) {
    return firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.Activity}/${roomId}`);
  }
}
