const Helper_absen = require("../helper/absen");
const { getDB } = require("../lib/firebase");

function getDay() {
  const days = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
  const date = new Date();
  const d = date.getDay();
  if (d != 0 && d <= 5) {
    let _d = days[d];
    return `${_d.slice(0, 1).toUpperCase()}${_d.slice(1).toLowerCase()}`;
  } else {
    return null;
  }
}

function getTime() {
  const date = new Date();
  let h = `${date.getHours()}`;
  let m = `${date.getMinutes()}`;
  return `${h.length == 1 ? `0${h}` : h}:${m.length == 1 ? `0${m}` : m}`;
}

async function absen(tag, WA) {
  if (getDay()) {
    const update = await Helper_absen(tag);
    if (update == 200) {
      const userData = await getDB(`siswa/${tag}`);
      await WA.sendMSG(
        "6285311174928",
        `*Siswa atas nama*\n${userData.nama} dari kelas ${userData.kelas}\nTelah absen pada hari ${getDay()} jam ${getTime()}.`.trim()
      );
      return {
        code: 200,
        message: "Berhasil absen",
      };
    }
    if (update == 304) {
      return {
        code: 304,
        message: "Sudah absen!",
      };
    }
    if (update == 400) {
      return {
        code: 400,
        message: "Parameter tag wajib di-isi!",
      };
    }
    if (update == 404) {
      return {
        code: 404,
        message: "Data belum terdaftar!",
      };
    }
    if (update == 500) {
      return {
        code: 500,
        message: "Kesalahan dari server",
      };
    }
  } else {
    return {
      code: 200,
    };
  }
}

module.exports = absen;
