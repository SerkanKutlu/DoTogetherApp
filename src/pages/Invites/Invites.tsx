import React, {useState, useEffect} from 'react';
import {DataTable, IconButton, Button} from 'react-native-paper';
import {RoomService} from '../../Services/RoomService';
import {RealTimeService} from '../../Services/RealTimeService';
import {ActiveUser} from '../../Services/AuthService';
import {View, Text} from 'react-native';
import useStyles from './InvitesStyle';
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
  const styles = useStyles();
  useEffect(() => {
    if (User != undefined) {
      realTimeService.OnInvite(User.user.email).on('child_added', newVal => {
        const inviteId = newVal.val().InviteId;
        const roomId = newVal.val().RoomId;
        roomService
          .GetRoomById(roomId)
          .then(room => {
            if (room != undefined) {
              realTimeService.RemoveReadedInvite(inviteId, User.user.email);
              roomService
                .CreateRoomInvite({
                  InviteId: newVal.val().InviteId,
                  InvitedBy: newVal.val().InvitedBy,
                  Title: room.Title,
                  RoomId: room.Id,
                  InvitedId: User.user.id,
                })
                .then(async () => {
                  await RefreshInvites();
                })
                .catch(() => {
                  console.log('invite olusmaadi');
                });
            }
          })
          .catch(() => {
            console.log('catch');
            return;
          });
      });
    }
  }, []);
  function GoBackButtonPressed() {
    navigation.navigate('OnBoard');
  }
  async function ApproveBtnClicked(item: any) {
    try {
      await roomService.JoinRoom(item.RoomId);
      roomService.DeleteRoomInvite(item.InviteId);
      roomService.DeleteRoomInvite(item.InviteId).then(() => {
        RefreshInvites();
      });
    } catch (error) {
      console.log('oda onaylanamadı. Tekrar dene.');
    }
  }
  async function RejectBtnClicked(item: any) {
    roomService.DeleteRoomInvite(item.InviteId).then(() => {
      RefreshInvites();
    });
  }
  async function RefreshInvites() {
    try {
      var invitesFromDb = await roomService.GetRoomInvites();
      if (invitesFromDb != undefined) {
        setInvites(invitesFromDb);
      }
    } catch (error) {
      console.log('refresh olmadi');
    }
  }
  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <IconButton
          icon="arrow-left-thin"
          size={30}
          onPress={() => GoBackButtonPressed()}
        />
        <View>
          <Text style={styles.invitesHeader}>Invites</Text>
        </View>
      </View>
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
                onPress={async () => await RejectBtnClicked(item)}
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
    </View>
  );
}
export default Invites;
