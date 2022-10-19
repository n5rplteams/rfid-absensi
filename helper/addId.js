const { getDB, updateDB } = require("../lib/firebase");
const getMode = require("./getMode");

async function Helper_addId(tag) {
  if (tag) {
    try {
      let mode = await getMode();
      let isAvailable = await getDB(`siswa/${tag}`);
      if (!isAvailable && mode == 1) {
        try {
          await updateDB(`siswa`, {
            [tag]: {
              tag: tag,
              absensi: {
                senin: 0,
                selasa: 0,
                rabu: 0,
                kamis: 0,
                jumat: 0,
              },
              nama: "",
              kelas: "",
              tel: "",
            },
          });
          return 201;
        } catch (err1) {
          console.log(err1);
          return 500;
        }
      } else {
        return 304;
      }
    } catch (err) {
      console.log(err);
      return 500;
    }
  } else {
    return 400;
  }
}

module.exports = Helper_addId;
