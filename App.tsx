import React from 'react';
import {SafeAreaView, Text, View} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {User} from './Models/User';
import {Device} from './Models/Device';
import {RoomService} from './Services/RoomService';
import {ActiveUser} from './Session/ActiveUser';
function App(): JSX.Element {
  ActiveUser.User = new User();
  var roomService = new RoomService();
  roomService.CreateRoom('auto room1');
  roomService.CreateRoom('auto room2');
  console.log(roomService.GetUserRooms());
  console.log('method mainde bitti');
  return (
    <SafeAreaView>
      <View>
        <Text>Serkan Hem iphone hem android</Text>
      </View>
    </SafeAreaView>
  );
}

export default App;
