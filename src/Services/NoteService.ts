import DeviceInfo from 'react-native-device-info';
import firestore from '@react-native-firebase/firestore';
import {Collections} from '../Constants/Collections';
import {Room} from '../Models/Room';
import {UserRoom} from '../Models/UserRoom';
import {ActiveUser} from './AuthService';
import {create} from 'react-test-renderer';
export class NoteService {
  async SaveNote(noteContent: string, roomId: string) {
    await firestore()
      .collection(Collections.Notes)
      .doc(roomId)
      .set({
        Text: noteContent,
      })
      .then(() => {
        console.log('Note Created or Updated At Firebase' + noteContent);
      })
      .catch(e => {
        throw new Error('Odaya Katılırken Hata Oluştu.');
      });
  }

  async GetNoteByRoomId(roomId: string): Promise<string | void> {
    try {
      const noteSnapShot = await firestore()
        .collection(Collections.Notes)
        .doc(roomId)
        .get();
      if (noteSnapShot.data() != undefined) {
        return noteSnapShot.data()?.Text;
      }
    } catch (e) {}
  }
}
