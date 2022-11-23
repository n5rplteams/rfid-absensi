import { initializeApp } from "firebase/app";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { getDatabase, ref, get, update } from "firebase/database";
import * as dotenv from "dotenv";

dotenv.config();
const env = process.env;

class FirebaseClient {
  constructor() {
    this.isLoggedIn = false;
    this.firebaseConfig = JSON.parse(env.FIREBASE_CONFIG);
    this.firebaseApp = null;
    this.firebaseAuth = null;
    this.firebaseDb = null;
    this.initialize();
  }

  initialize() {
    this.firebaseApp = initializeApp(this.firebaseConfig);
    this.firebaseAuth = getAuth(this.firebaseApp);
    this.firebaseDb = getDatabase(this.firebaseApp);
  }

  async signIn() {
    try {
      let user = await signInWithEmailAndPassword(
        this.firebaseAuth,
        env.FIREBASE_EMAIL,
        env.FIREBASE_PASSWORD
      );
      if (user) {
        this.isLoggedIn = true;
        console.log("Firebase logged in");
      } else {
        this.isLoggedIn = false;
        console.log("Firebase failed log in");
      }
    } catch (err) {
      this.isLoggedIn = false;
      console.log(err);
    }
  }

  async getDB(reference) {
    try {
      let snapshot = await get(ref(this.firebaseDb, reference));
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return null;
      }
    } catch (err) {
      console.log(`getDB Error: ${err}`);
      return null;
    }
  }

  async updateDB(reference, data) {
    try {
      await update(ref(this.firebaseDb, reference), data);
    } catch (err) {
      console.log(`updateDB Error: ${err}`);
      return null;
    }
  }
}

export default FirebaseClient;
