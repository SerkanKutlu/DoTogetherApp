import React, {useState, useEffect} from 'react';
import {DataTable, IconButton, ActivityIndicator} from 'react-native-paper';
import {RoomService} from '../../Services/RoomService';
import {RealTimeService} from '../../Services/RealTimeService';
import {ActiveUser} from '../../Services/AuthService';
import {View, Text, BackHandler} from 'react-native';
import useStyles from './InvitesStyle';
import {useTranslation} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import '../../assets/i18n';
function Invites({navigation, route}): JSX.Element {
  const [invites, setInvites] = useState<any[]>(route.params.Invites);
  const [invitesPageNumber, setInvitesPageNumber] = React.useState<number>(0);
  const [isLoadingVisible, setIsLoadingVisible] = useState(false);
  const itemPerPage = 10;
  const fromInvites = invitesPageNumber * itemPerPage;
  const toInvites = Math.min(
    (invitesPageNumber + 1) * itemPerPage,
    invites.length,
  );
  const roomService = new RoomService();
  const realTimeService = new RealTimeService();
  const User = ActiveUser.GetActiveUser();
  const styles = useStyles();
  const {t, i18n} = useTranslation();
  const changeLanguage = (value: any) => {
    i18n.changeLanguage(value);
  };
  useEffect(() => {
    const preferredLanguage = RNLocalize.getLocales()[0].languageTag;
    if (preferredLanguage.includes('tr')) {
      changeLanguage('tr');
    }
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.navigate('OnBoard');
        return true;
      },
    );
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
    return () => {
      backHandler.remove();
      if (User != undefined) {
        realTimeService.OnInvite(User.user.email).off('child_added');
      }
    };
  }, []);
  function GoBackButtonPressed() {
    navigation.navigate('OnBoard');
  }
  async function ApproveBtnClicked(item: any) {
    try {
      setIsLoadingVisible(true);
      await roomService.JoinRoom(item.RoomId);
      roomService.DeleteRoomInvite(item.InviteId).then(() => {
        RefreshInvites();
        setIsLoadingVisible(false);
        realTimeService.InviteAccepted(item.RoomId);
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
      <ActivityIndicator
        animating={isLoadingVisible}
        style={styles.loadingIcon}
        size={'small'}
      />
      <View style={styles.navbar}>
        <IconButton
          icon="arrow-left-thin"
          size={30}
          onPress={() => GoBackButtonPressed()}
        />
        <View>
          <Text style={styles.invitesHeader as any}>{t('invites')}</Text>
        </View>
      </View>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title style={{flex: 5}}>{t('invitedBy')}</DataTable.Title>
          <DataTable.Title style={{flex: 5}}>{t('roomName')}</DataTable.Title>
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
