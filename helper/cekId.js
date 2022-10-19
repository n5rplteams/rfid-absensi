const { getDB } = require("../lib/firebase");

async function Helper_cekId(tag) {
  if (tag) {
    try {
      let snapshot = await getDB(`siswa/${tag}`);
      if (snapshot) {
        return snapshot;
      } else {
        return 404;
      }
    } catch (err) {
      console.log(err);
      return 500;
    }
  } else {
    return 400;
  }
}

module.exports = Helper_cekId;
