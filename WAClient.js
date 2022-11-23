import * as WA from "whatsapp-web.js";
import * as QR from "qrcode";
import qrcode from "qrcode-terminal";
// const { Client, LocalAuth } = wa_web;

// class WAClient {
//   constructor(session) {
//     this.isReady = false;
//     this.prefix = "";
//     this.qrBase64 = "";
//     this.client = new Client({
//       restartOnAuthFail: true,
//       puppeteer: {
//         headless: true,
//         args: [
//           "--no-sandbox",
//           "--disable-setuid-sandbox",
//           "--disable-dev-shm-usage",
//           "--disable-accelerated-2d-canvas",
//           "--no-first-run",
//           "--no-zygote",
//           "--single-process",
//           "--disable-gpu",
//         ],
//       },
//       authStrategy: new LocalAuth({ clientId: session || "client-1" }),
//     });
//     this.on = this.client.on;
//     this.commands = [];
//     this.initialize();
//   }

//   initialize() {
//     this.client.on("qr", (qr) => {
//       QR.toDataURL(qr, (err, url) => {
//         this.qrBase64 = url;
//       });
//       qrcode.generate(qr, { small: true });
//     });
//     this.client.on("authenticated", () => {
//       this.qrBase64 = "";
//       console.log("WhatsApp Autheticated.");
//     });
//     this.client.on("ready", () => {
//       this.isReady = true;
//       console.log("WhatsApp is Ready.");
//     });
//     this.client.initialize();
//   }

//   async sendMSG(number, msg) {
//     try {
//       await this.client.sendMessage(`${number}@c.us`, msg);
//     } catch (err) {
//       console.log(err);
//     }
//   }
// }

class WAClient extends WA.Client {
  constructor(...args) {
    super(...args);
    this.isReady = false;
    this.qrBase64 = "";
    this.initialize();
    this.on("qr", (qr) => {
      QR.toDataURL(qr, (err, url) => {
        qrcode.generate(qr, { small: true });
        this.qrBase64 = url;
      });
    });
    this.on("authenticated", () => {
      this.qrBase64 = "";
      console.log("WhatsApp Autheticated.");
    });
    this.on("ready", () => {
      this.isReady = true;
      console.log("WhatsApp is Ready.");
    });
  }

  /**
   *
   * @param {String} number
   * @returns "62********@c.us"
   */
  #phoneFormatter(number = "") {
    let formatted = number.replace(/\D/g, "");
    if (formatted.startsWith("0")) {
      formatted = "62" + formatted.substr(1);
    }
    if (!formatted.endsWith("@c.us")) {
      formatted += "@c.us";
    }

    return formatted;
  }

  /**
   *
   * @param {String} number
   * @returns true | false
   */
  async #checkRegisteredNumber(number = "") {
    return await this.isRegisteredUser(number);
  }

  async sendMSG(number, msg) {
    number = this.#phoneFormatter(number);
    let isRegistered = await this.#checkRegisteredNumber(number);
    try {
      console.log(number, msg);
      await this.sendMessage(`${number}`, msg);
    } catch (err) {
      console.log(err);
    }
    if (!isRegistered) {
      console.log(`${number} is not registered.`);
    }
  }
}

export default WAClient;
