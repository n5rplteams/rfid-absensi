require("dotenv").config();
const { initializeApp } = require("firebase/app");
const { signInWithEmailAndPassword, getAuth } = require("firebase/auth");
const { getDatabase, ref, get, update } = require("firebase/database");

const env = process.env;

let firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;

let isLoggedIn = false;

function initialize() {
  firebaseApp = initializeApp(firebaseConfig);
  firebaseAuth = getAuth(firebaseApp);
  firebaseDb = getDatabase(firebaseApp);
}

function signIn() {
  signInWithEmailAndPassword(
    firebaseAuth,
    env.FIREBASE_EMAIL,
    env.FIREBASE_PASSWORD
  )
    .then(() => {
      isLoggedIn = true;
      console.log("Firebase is Logged In.");
    })
    .catch(() => {
      isLoggedIn = false;
      console.log("Firebase is Failed Logged In.");
    });
}

async function getDB(reference) {
  try {
    let snapshot = await get(ref(firebaseDb, reference));
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

async function updateDB(reference, data) {
  try {
    let snapshot = await update(ref(firebaseDb, reference), data);
    console.log(snapshot);
  } catch (err) {
    console.log(`updateDB Error: ${err}`);
    return null;
  }
}

module.exports = {
  firebaseApp,
  firebaseDb,
  isLoggedIn,
  initialize,
  signIn,
  getDB,
  updateDB,
};
