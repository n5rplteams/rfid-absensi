const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
let isReady = false;

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
  // Print WhatsApp Client QR
  client.on("qr", (qr) => qrcode.generate(qr, { small: true }));

  // Validate is WhatsApp Client Authenticated
  client.on("authenticated", () => {
    console.log("WhatsApp Autheticated.");
  });

  // Get WhatsApp Client ready Status
  client.on("ready", () => {
    isReady = true;
    console.log("WhatsApp is Ready.");
  });

  // initialize WhatsApp Client
  client.initialize();
}

function sendMSG(number, msg) {
  client.sendMessage(`${number}@c.us`, msg).catch((err) => console.log(err));
}

module.exports = {
  initialize,
  isReady,
  sendMSG,
  client,
};
