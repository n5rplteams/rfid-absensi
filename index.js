import express from "express";
import WAClient from "./WAClient.js";
import FirebaseClient from "./FirebaseClient.js";
import Helper from "./Helper.js";
import Controller from "./Controller.js";
import WA_WEB from "whatsapp-web.js";
import { unlinkSync } from "fs";
const { LocalAuth } = WA_WEB;
import * as dotenv from "dotenv";
dotenv.config();

const WA = new WAClient({
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu",
    ],
  },
  authStrategy: new LocalAuth(),
});

const FIREBASE = new FirebaseClient();
const HELPER = new Helper(FIREBASE, WA);
const CONTROLLER = new Controller(FIREBASE, WA, HELPER);

(async () => {
  try {
    await FIREBASE.signIn();
    const app = express();
    const PORT = process.env.PORT || 8080;
    app.get("/get-mode", async (req, res) => {
      const d = await CONTROLLER.getMode();
      res.json(d);
    });
    app.get("/add-id", async (req, res) => {
      const d = await CONTROLLER.addId(req.query["tag"], WA);
      res.json(d);
    });
    app.get("/absen-id", async (req, res) => {
      let d = await CONTROLLER.absenId(req.query["tag"], WA);
      res.json(d);
    });
    app.get("/cek-id", async (req, res) => {
      const d = await CONTROLLER.cekId(req.query["tag"]);
      res.json(d);
    });
    app.get("/get-csv", async (req, res) => {
      const d = await CONTROLLER.getCSV();
      res.json({
        status: 200,
        url: d.url,
      });
      unlinkSync(d.name_file)
    });
    app.get("/qr", (req, res) => {
      if(!WA.isReady) {
        res.send(`<img src="${WA.qrBase64}" width="150" height="150">`);
      } else {
        res.json({
          status: 403,
          message: "WhatsApp already signed in."
        });
      }
    });
    app.listen(PORT, () => {
      console.log(`Listening to port: ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
})();
