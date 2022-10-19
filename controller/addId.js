const Helper_addId = require("../helper/addId");

async function addID(tag, WA) {
  let add = await Helper_addId(tag);

  if (add == 201) {
    await WA.sendMSG(
      "6285311174928",
      `*Data baru telah ditambahkan!*\n\nDengan data sebgai berikut:\nID: ${req.query["tag"]}\nNama: -\nKelas: -`
    );
    return {
      code: 201,
      message: "Data berhasil ditambahkan",
    };
  }
  if (add == 304) {
    return {
      code: 304,
      message: "Data sudah tersedia sebelumnya!",
    };
  }
  if (add == 400) {
    return {
      code: 400,
      message: "Parameter tag wajib di-isi!",
    };
  }
  if (add == 500) {
    return {
      code: 500,
      message: "Kesalahan dari server",
    };
  }
}

module.exports = addID;
