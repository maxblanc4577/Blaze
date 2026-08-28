import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

export const googleAuthProvider = new GoogleAuthProvider();
// Request Google Contacts scopes along with standard OAuth scopes
googleAuthProvider.addScope('https://www.googleapis.com/auth/contacts.readonly');
googleAuthProvider.addScope('https://www.googleapis.com/auth/user.emails.read');
googleAuthProvider.addScope('https://www.googleapis.com/auth/user.phonenumbers.read');

export async function signInWithGoogleContacts() {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    const user = result.user;
    return { user, token };
  } catch (error) {
    console.error('Google Sign-In error:', error);
    throw error;
  }
}

export async function logOutUser() {
  await signOut(auth);
}
