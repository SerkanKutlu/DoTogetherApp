import auth from '@react-native-firebase/auth';
import {
  GoogleSignin,
  statusCodes,
  User,
} from '@react-native-google-signin/google-signin';
export async function GoogleLogin() {
  console.log('Login google');
  GoogleSignin.configure({
    webClientId:
      '734448664317-0uiivvd6jqlilvqulnvqeq5k3ha5lcam.apps.googleusercontent.com',
    iosClientId:
      '734448664317-s92c2jo00mnoiqs6mob35ougosc57ad4.apps.googleusercontent.com',
    offlineAccess: true,
  });
  try {
    const user = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(user.idToken);
    console.log('auth olduk');
    await auth().signInWithCredential(googleCredential);
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('user cancelled google auth sign in flow');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log('user double clicked google auth sign in flow');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.log('google play not avaiable');
    } else {
      console.log('Unknown Error:' + error);
    }
  }
}
export function LoginAgain(): Promise<void | User> {
  GoogleSignin.configure({
    webClientId:
      '734448664317-0uiivvd6jqlilvqulnvqeq5k3ha5lcam.apps.googleusercontent.com',
    iosClientId:
      '734448664317-s92c2jo00mnoiqs6mob35ougosc57ad4.apps.googleusercontent.com',
    offlineAccess: true,
  });
  return GoogleSignin.signInSilently()
    .then(user => {
      return user;
    })
    .catch(error => {
      if (error.code === statusCodes.SIGN_IN_REQUIRED) {
        console.log('User should be sign in');
      } else {
        console.log('Unknown Error:' + error);
      }
    });
}
