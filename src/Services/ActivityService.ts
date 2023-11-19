import firestore from '@react-native-firebase/firestore';
import {Collections} from '../Constants/Collections';
import uuid from 'react-native-uuid';
import {firebase} from '@react-native-firebase/auth';
import {Sockets} from '../Constants/Sockets';
import {Platform} from 'react-native';
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
  async DeleteActiveReal(userEmail: string, roomId: string) {
    await firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.Activity}/${roomId}/${userEmail.replace('.', '')}`)
      .remove();
  }
  async ReadActivesOnceReal(roomId: string) {
    return await firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.Activity}/${roomId}`)
      .once('value');
  }
  async ReadActivesOnceRealByEmail(roomId: string, userEmail: string) {
    return await firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.Activity}/${roomId}//${userEmail.replace('.', '')}`)
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
        LastSignalDate: Date.now(),
      })
      .then(() => {})
      .catch(e => {
        console.log('Odaya Katılırken Hata Oluştu. Real. ' + e);
      });
  }
  OnActivityChangeReal(roomId: string) {
    return firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.Activity}/${roomId}`);
  }

  async UpdateLastSignalDate(userEmail: string, roomId: string) {
    await firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.Activity}/${roomId}/${userEmail.replace('.', '')}`)
      .update({
        LastSignalDate: Date.now(),
      })
      .then(() => {})
      .catch(e => {
        console.log('Odaya Katılırken Hata Oluştu. Real. ' + e);
      });
  }
  async AddDeleteReason(userEmail: string, roomId: string) {
    await firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.Activity}/${roomId}/${userEmail.replace('.', '')}`)
      .update({
        LastSignalDate: Date.now(),
        DeleteReason: 'inactive user',
      })
      .then(() => {})
      .catch(e => {
        console.log('Odaya Katılırken Hata Oluştu. Real. ' + e);
      });
  }
}
