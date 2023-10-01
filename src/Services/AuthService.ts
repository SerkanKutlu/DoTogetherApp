import auth from '@react-native-firebase/auth';
import {
  GoogleSignin,
  statusCodes,
  User,
} from '@react-native-google-signin/google-signin';

import {appleAuth} from '@invertase/react-native-apple-authentication';
export class ActiveUser {
  private static user: User | undefined;
  static GetActiveUser(): User | undefined {
    if (this.user != undefined) return this.user;
  }
  static SetActiveUser(user: User) {
    this.user = user;
  }
}
export class AuthService {
  constructor() {
    GoogleSignin.configure({
      webClientId:
        '734448664317-0uiivvd6jqlilvqulnvqeq5k3ha5lcam.apps.googleusercontent.com',
      iosClientId:
        '734448664317-s92c2jo00mnoiqs6mob35ougosc57ad4.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }

  async GoogleLogin(): Promise<boolean> {
    try {
      const user = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(user.idToken);
      await auth().signInWithCredential(googleCredential);
      ActiveUser.SetActiveUser(user);
      return true;
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
      return false;
    }
  }
  async LoginAgain() {
    GoogleSignin.configure({
      webClientId:
        '734448664317-0uiivvd6jqlilvqulnvqeq5k3ha5lcam.apps.googleusercontent.com',
      iosClientId:
        '734448664317-s92c2jo00mnoiqs6mob35ougosc57ad4.apps.googleusercontent.com',
      offlineAccess: true,
    });
    try {
      var user = await GoogleSignin.signInSilently();
      ActiveUser.SetActiveUser(user);
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_REQUIRED) {
        console.log('User should be sign in');
        throw 'User should be sign in';
      } else {
        console.log('Unknown Error:' + error);
        throw 'Unknown Error:' + error;
      }
    }
  }
  async AppleLogin() {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });
      const {identityToken, nonce} = appleAuthRequestResponse;
      if (identityToken) {
        // 3). create a Firebase `AppleAuthProvider` credential
        const appleCredential = auth.AppleAuthProvider.credential(
          identityToken,
          nonce,
        );

        // 4). use the created `AppleAuthProvider` credential to start a Firebase auth request,
        //     in this example `signInWithCredential` is used, but you could also call `linkWithCredential`
        //     to link the account to an existing user
        const userCredential = await auth().signInWithCredential(
          appleCredential,
        );

        // user is now signed in, any Firebase `onAuthStateChanged` listeners you have will trigger
        console.log(
          `Firebase authenticated via Apple, UID: ${userCredential.user.uid}`,
        );
      }
    } catch (e) {
      console.log('catch' + e);
    }
  }
}
