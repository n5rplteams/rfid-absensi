const Helper_cekId = require("../helper/cekId");

async function cekID(tag) {
  try {
    let cek = await Helper_cekId(tag);
    if (cek == 400) {
      return {
        code: 400,
        message: "Parameter tag wajib di-isi!",
      };
    } else if (cek == 404) {
      return {
        code: 404,
        message: "Data tidak ditemukan",
      };
    } else if (cek == 500) {
      return {
        code: 500,
        message: "Kesalahan dari server!",
      };
    } else {
      return {
        code: 200,
        message: "Data tersedia",
        data: cek,
      };
    }
  } catch (err) {
    console.log(err);
    return {
      code: 500,
      message: err,
    };
  }
}

module.exports = cekID;
