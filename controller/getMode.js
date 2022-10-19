const Helper_getMode = require("../helper/getMode");

async function getMODE() {
  try {
    let mode = await Helper_getMode();
    if (mode !== null) {
      return {
        code: 200,
        mode: mode,
        message: mode == 0 ? "absen" : "add",
      };
    } else {
      return {
        code: 404,
        message: "Mode tidak ditemukan",
      };
    }
  } catch (err) {
    return {
      code: 500,
      message: "Kesalahan dari server",
    };
  }
}

module.exports = getMODE;
