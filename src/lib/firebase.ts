import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyB-O0k1_5_jrBw0F5NKC0vEK7Uxqs2x8y0',
  authDomain: 'vitally-a056d.firebaseapp.com',
  projectId: 'vitally-a056d',
  storageBucket: 'vitally-a056d.firebasestorage.app',
  messagingSenderId: '306357887978',
  appId: '1:306357887978:web:dc4e8e3c280fef2a718893'
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099')
}
