require("dotenv").config();
const express = require("express");
const WA = require("./lib/whatsapp");
const FIREBASE = require("./lib/firebase");
const controller = require("./controller/all");

const app = express();
const PORT = process.env.PORT || 8080;

(async () => {
  await FIREBASE.initialize();
  await FIREBASE.signIn();
  await WA.initialize();

  app.get("/get-mode", async (req, res) => {
    res.json(await controller.getMODE());
  });

  app.get("/add-id", async (req, res) => {
    res.json(await controller.addID(req.query["tag"], WA));
  });

  app.get("/absen-id", async (req, res) => {
    res.json(await controller.absen(req.query["tag"], WA));
  });

  app.get("/cek-id", async (req, res) => {
    res.json(await controller.cekID(req.query["tag"]));
  });

  app.listen(PORT, () => {
    console.log(`Listening to port: ${PORT}`);
  });
})();
