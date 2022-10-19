const { getDB, updateDB } = require("../lib/firebase");

function getDay() {
  const days = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
  const date = new Date();
  const d = date.getDay();
  if (d != 0 && d <= 5) {
    return days[d];
  } else {
    return null;
  }
}

async function Helper_absen(tag) {
  if (tag) {
    try {
      let get = await getDB(`siswa/${tag}`);
      if (get && getDay()) {
        if (get.absensi[getDay()] == 0) {
          try {
            await updateDB(`siswa/${tag}/absensi`, { [getDay()]: 1 });
            return 200;
          } catch (error) {
            console.log(error);
            return 500;
          }
        } else {
            return 304;
        }
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

module.exports = Helper_absen;
