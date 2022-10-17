const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
let ready = false;

const client = new Client({
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
  authStrategy: new LocalAuth({ clientId: "client-1" }),
});

function initialize() {
  client.on("qr", (qr) => qrcode.generate(qr, { small: true }));
  client.on("authenticated", () => {
    console.log("Autheticated.");
  });
  client.once("ready", () => {
    ready = true;
    console.log("Ready..");
  })
  client.initialize();
}

function isReady() {
  return ready;
}

function sendMSG(number, msg) {
  client.sendMessage(`${number}@c.us`, msg);
}

module.exports = {
  initialize,
  isReady,
  sendMSG,
};
