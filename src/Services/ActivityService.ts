import firestore from '@react-native-firebase/firestore';
import {Collections} from '../Constants/Collections';
import uuid from 'react-native-uuid';
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
    await firestore()
      .collection(Collections.Activity)
      .doc(roomId)
      .collection(Collections.ActiveUsers)
      .doc(userEmail)
      .delete()
      .then(() => {
        console.log('MakeActive DELETED');
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
  TrackActivityChange(onResult: any, onError: any, roomId: string) {
    firestore()
      .collection(Collections.Activity)
      .doc(roomId)
      .collection(Collections.ActiveUsers)
      .onSnapshot(onResult, onError);
  }
}
