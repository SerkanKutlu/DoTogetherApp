import React, {useState, useEffect} from 'react';
import {DataTable, IconButton} from 'react-native-paper';
import {RoomService} from '../../Services/RoomService';
import {RealTimeService} from '../../Services/RealTimeService';
import {ActiveUser} from '../../Services/AuthService';
function Invites({navigation, route}): JSX.Element {
  const [invites, setInvites] = useState<any[]>(route.params.Invites);
  const [invitesPageNumber, setInvitesPageNumber] = React.useState<number>(0);
  const itemPerPage = 5;
  const fromInvites = invitesPageNumber * itemPerPage;
  const toInvites = Math.min(
    (invitesPageNumber + 1) * itemPerPage,
    invites.length,
  );
  const roomService = new RoomService();
  const realTimeService = new RealTimeService();
  const User = ActiveUser.GetActiveUser();
  useEffect(() => {
    console.log('invites use effec tstart');
    if (User != undefined) {
      console.log('invites use effec user is defined');
      realTimeService.OnInvite(User.user.email).on('child_added', newVal => {
        console.log('invites use effect on in');
        const inviteId = newVal.val().InviteId;
        const roomId = newVal.val().RoomId;
        console.log(roomId);
        roomService
          .GetRoomById(roomId)
          .then(room => {
            console.log('invites use effec room then');
            if (room != undefined) {
              console.log('invites use effect room is defined');
              console.log(room);
              realTimeService.RemoveReadedInvite(inviteId, User.user.email);
              invites.push({
                InviteId: newVal.val().InviteId,
                InvitedBy: newVal.val().InvitedBy,
                Title: room.Title,
                RoomId: room.Id,
              });
              const newInvites = invites.slice();
              setInvites(newInvites);
            }
          })
          .catch(() => {
            console.log('catch');
            return;
          });
      });
    }
    console.log('use effect end');
  }, []);
  async function ApproveBtnClicked(item: any) {
    try {
      console.log(item);
      await roomService.JoinRoom(item.RoomId);
      var newInvites = invites.filter(i => i.InviteId !== item.InviteId);
      setInvites(newInvites);
    } catch (error) {
      console.log('oda onaylanamadı. Tekrar dene.');
    }
  }
  return (
    <DataTable>
      <DataTable.Header>
        <DataTable.Title style={{flex: 5}}>Invited By</DataTable.Title>
        <DataTable.Title style={{flex: 5}}>Room Title</DataTable.Title>
        <DataTable.Title style={{flex: 4}}> </DataTable.Title>
      </DataTable.Header>

      {invites.slice(fromInvites, toInvites).map(item => (
        <DataTable.Row key={item.InviteId}>
          <DataTable.Cell style={{flex: 5}}>{item.InvitedBy}</DataTable.Cell>
          <DataTable.Cell style={{flex: 5}}>{item.Title}</DataTable.Cell>
          <DataTable.Cell style={{flex: 3}}>
            <IconButton
              icon="check"
              size={20}
              onPress={async () => await ApproveBtnClicked(item)}
              style={{margin: 0}}
            />
            <IconButton
              icon="close"
              size={20}
              onPress={() => console.log('declined')}
              style={{margin: 0}}
            />
          </DataTable.Cell>
        </DataTable.Row>
      ))}

      <DataTable.Pagination
        page={invitesPageNumber}
        numberOfPages={Math.ceil(invites.length / itemPerPage)}
        onPageChange={page => setInvitesPageNumber(page)}
        label={`${fromInvites + 1}-${toInvites} of ${invites.length}`}
        numberOfItemsPerPage={itemPerPage}
        showFastPaginationControls
      />
    </DataTable>
  );
}
export default Invites;
