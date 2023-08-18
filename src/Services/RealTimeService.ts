import {firebase} from '@react-native-firebase/database';
import {Sockets} from '../Constants/Sockets';
import uuid from 'react-native-uuid';
export class RealTimeService {
  OnInvite(activeUserEmail: string) {
    return firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.Invite}/${activeUserEmail.replace('.', '')}`);
  }

  SendInvite(invitedby: string, invited: string) {
    const inviteId = uuid.v4().toString();
    firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.Invite}/${invited.replace('.', '')}/${inviteId}`)
      .set({
        InviteId: inviteId,
        InvitedBy: invitedby,
      })
      .then(() => {});
  }
  RemoveReadedInvite(inviteId: string, invited: string) {
    firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.Invite}/${invited.replace('.', '')}/${inviteId}`)
      .remove();
  }
}
