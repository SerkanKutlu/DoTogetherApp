import DeviceInfo from 'react-native-device-info';
import firestore from '@react-native-firebase/firestore';
import {firebase} from '@react-native-firebase/auth';
import {Collections} from '../Constants/Collections';
import {Room} from '../Models/Room';
import {UserRoom} from '../Models/UserRoom';
import {ActiveUser} from './AuthService';
import {create} from 'react-test-renderer';
import {Sockets} from '../Constants/Sockets';
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

  async SaveNoteReal(noteContent: string, roomId: string) {
    await firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.Notes}/${roomId}`)
      .set({
        RoomId: roomId,
        Content: noteContent,
      })
      .then(() => {})
      .catch(e => {
        console.log('Odaya Katılırken Hata Oluştu. Real. ' + e);
      });
  }

  async GetNoteByRoomIdReal(roomId: string) {
    return await firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.Notes}/${roomId}`)
      .once('value');
  }

  OnNoteChangeReal(roomId: string) {
    return firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.Notes}/${roomId}`);
  }
}
