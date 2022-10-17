const express = require("express");
const { initializeApp } = require("firebase/app");
const { signInWithEmailAndPassword, getAuth } = require("firebase/auth");
const { getDatabase, ref, onValue, get, update } = require("firebase/database");
const WA = require("./whatsapp");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);

const firebaseApp = initializeApp(firebaseConfig);
const firebaseDb = getDatabase(firebaseApp);

function signIn() {
  signInWithEmailAndPassword(
    getAuth(firebaseApp),
    process.env.FIREBASE_EMAIL,
    process.env.FIREBASE_PASSWORD
  )
    .then((e) => console.log("Login"))
    .catch((err) => console.log("Failed Login"));
}

async function getMode() {
  try {
    let snapshot = await get(ref(firebaseDb, "mode"));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return console.log("No data available");
    }
  } catch (err) {
    return console.log(err);
  }
}

(() => {
  signIn();
  WA.initialize();
  app.get("/cek-id", async (req, res) => {
    const get = req.query;
    res.json({
      tag: get["tag"] || "0",
      mode: (await getMode()) == 0 ? "add" : "absen",
    });
  });

  app.get("/add-id", async (req, res) => {
    await addId(req, res);
  });

  app.get("/absen", async (req, res) => {
    await setAbsen(req, res);
  });

  app.listen(PORT, () => {
    console.log(`Listening to port: ${PORT}`);
  });
})();

async function setAbsen(req, res) {
  const get = req.query;
  if (get["tag"]) {
    if (await WA.isReady()) {
      WA.sendMSG("6285311174928", "Absen Berhasil");
      res.json({
        code: 200,
        message: "Absensi berhasil dilakukan!",
      });
    } else {
      res.json({
        code: 500,
        message: "Whatsapp not ready yet!",
      });
    }
  } else {
    res.json({
      code: 403,
    });
  }
}

async function addId(req, res) {
  const get = req.query;
  if (get["tag"]) {
    update(ref(`siswa/${get["tag"]}`), { tag: get["tag"] }).then(e => {
      return res.json({
        tag: get["tag"],
        code: 201,
        msg: "Tag added",
      });
    }).catch(err => {
      console.log(err);
      res.json({
        code: 500,
        message: err.message,
      });
    })
  } else {
    res.json({
      code: 403,
      message: "acess denied.",
    });
  }
}

async function getTag(tag) {
  try {
    let res = await get(ref(`siswa/${tag}`));
    return res;
  } catch (err) {
    console.log(err);
    return null;
  }
}
