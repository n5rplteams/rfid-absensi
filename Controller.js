import * as XLSX from "xlsx";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { join } from "path";
import { convertCsvToXlsx } from "@aternus/csv-to-xlsx";
import { equalTo, get, orderByChild, query, ref } from "firebase/database";
dotenv.config();
const env = process.env;

class Controller {
  constructor(Firebase, Wa, Helper) {
    this.Firebase = Firebase;
    this.WA = Wa;
    this.Helper = Helper;
  }

  async getMode() {
    try {
      let mode = await this.Helper.getMode();
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

  async cekId(tag) {
    try {
      let cek = await this.Helper.cekId(tag);
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

  async addId(tag) {
    let add = await this.Helper.addId(tag);

    if (add == 201) {
      // await this.WA.sendMSG(
      //   `${env.ADMIN_NUMBER}`,
      //   `*Data baru telah ditambahkan!*\n\nDengan ID: ${tag}\n`
      // );
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

  async absenId(tag) {
    console.log(tag);
    if (this.Helper.getDay()) {
      let time = new Date();
      const update = await this.Helper.absenId(tag, time.getTime());
      if (update == 200) {
        const userData = Object.values(
          (
            await get(
              query(
                ref(this.Firebase.firebaseDb, "pegawai"),
                orderByChild("id_card"),
                equalTo(tag)
              )
            )
          ).val()
        )[0];
        const status = this.Helper.getStatusAbsen(time.getTime());
        let text = "";
        if (status == 2) {
          text = `*Pegawai atas nama*\n${userData.nama} dari kelas ${
            userData.kelas
          }\nTelah pulang pada hari ${this.Helper.getDay()} jam ${time.getHours()}:${time.getMinutes()}.`.trim();
        } else {
          text = `*Pegawai atas nama*\n${userData.nama} dari kelas ${
            userData.kelas
          }\nTelah absen pada hari ${this.Helper.getDay()} jam ${time.getHours()}:${time.getMinutes()}.\nStatus absen: *${
            status == 1 ? "Tepat Waktu" : "Telat"
          }*`.trim();
        }

        if (userData.tel_atasan) {
          this.WA.sendMSG(userData.tel_atasan, text);
        }

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

  async getCSV() {
    let get = Object.values(await this.Firebase.getDB("pegawai"));
    let laporanJSON = get.map((el) => {
      return {
        id: el.id,
        nama: el.nama,
        kelas: el.kelas,
        senin: {
          tanggal: el.absensi?.senin?.hadir?.tanggal ?? "-",
          "jam-hadir": el.absensi?.senin?.hadir?.jam ?? "-",
          status: el.absensi?.senin?.hadir?.status ?? "-",
          "jam-pulang": el.absensi?.senin?.pulang.jam ?? "-",
        },
        selasa: {
          tanggal: el.absensi?.selasa?.hadir?.tanggal ?? "-",
          "jam-hadir": el.absensi?.selasa?.hadir?.jam ?? "-",
          status: el.absensi?.selasa?.hadir?.status ?? "-",
          "jam-pulang": el.absensi?.selasa?.pulang.jam ?? "-",
        },
        rabu: {
          tanggal: el.absensi?.rabu?.hadir?.tanggal ?? "-",
          "jam-hadir": el.absensi?.rabu?.hadir?.jam ?? "-",
          status: el.absensi?.rabu?.hadir?.status ?? "-",
          "jam-pulang": el.absensi?.rabu?.pulang.jam ?? "-",
        },
        kamis: {
          tanggal: el.absensi?.kamis?.hadir?.tanggal ?? "-",
          "jam-hadir": el.absensi?.kamis?.hadir?.jam ?? "-",
          status: el.absensi?.kamis?.hadir?.status ?? "-",
          "jam-pulang": el.absensi?.kamis?.pulang.jam ?? "-",
        },
        jumat: {
          tanggal: el.absensi?.jumat?.hadir?.tanggal ?? "-",
          "jam-hadir": el.absensi?.jumat?.hadir?.jam ?? "-",
          status: el.absensi?.jumat?.hadir?.status ?? "-",
          "jam-pulang": el.absensi?.jumat?.pulang.jam ?? "-",
        },
        sabtu: {
          tanggal: el.absensi?.sabtu?.hadir?.tanggal ?? "-",
          "jam-hadir": el.absensi?.sabtu?.hadir?.jam ?? "-",
          status: el.absensi?.sabtu?.hadir?.status ?? "-",
          "jam-pulang": el.absensi?.sabtu?.pulang.jam ?? "-",
        },
      };
    });

    let laporanCSV =
      "id,nama,kelas,senin,,,,selasa,,,,rabu,,,,kamis,,,,jumat,,,,sabtu,,,,\n";
    laporanCSV +=
      ",,," + "tanggal,jam-hadir,status,jam-pulang,".repeat(6) + "\n";
    laporanJSON.forEach((el) => {
      laporanCSV += `"${el.id}","${el.nama}","${el.kelas}","${el.senin.tanggal}","${el.senin["jam-hadir"]}","${el.senin.status}","${el.senin["jam-pulang"]}","${el.selasa.tanggal}","${el.selasa["jam-hadir"]}","${el.selasa.status}","${el.selasa["jam-pulang"]}","${el.rabu.tanggal}","${el.rabu["jam-hadir"]}","${el.rabu.status}","${el.rabu["jam-pulang"]}","${el.kamis.tanggal}","${el.kamis["jam-hadir"]}","${el.kamis.status}","${el.senin["jam-pulang"]}","${el.jumat.tanggal}","${el.jumat["jam-hadir"]}","${el.jumat.status}","${el.jumat["jam-pulang"]}","${el.sabtu.tanggal}","${el.sabtu["jam-hadir"]}","${el.sabtu.status}","${el.sabtu["jam-pulang"]}",\n`;
    });
    let nameFile = join(process.cwd(), "report", `${Date.now()}`);

    if (!fs.existsSync(join(process.cwd(), "report"))) {
      fs.mkdirSync(join(process.cwd(), "report"));
    }

    fs.writeFileSync(`${nameFile}.csv`, laporanCSV);

    return {
      name_file: `${nameFile}.csv`,
      url:
        "data:text/csv;base64," +
        fs.readFileSync(`${nameFile}.csv`, "base64url"),
    };
    // form.append(file, "");
  }

  async saveCSV() {
    let get = Object.values(await this.Firebase.getDB("pegawai"));
    let laporanJSON = get.map((el) => {
      return {
        id: el.id,
        nama: el.nama,
        kelas: el.kelas,
        senin: {
          tanggal: el.absensi?.senin?.hadir?.tanggal ?? "-",
          "jam-hadir": el.absensi?.senin?.hadir?.jam ?? "-",
          status: el.absensi?.senin?.hadir?.status ?? "-",
          "jam-pulang": el.absensi?.senin?.pulang.jam ?? "-",
        },
        selasa: {
          tanggal: el.absensi?.selasa?.hadir?.tanggal ?? "-",
          "jam-hadir": el.absensi?.selasa?.hadir?.jam ?? "-",
          status: el.absensi?.selasa?.hadir?.status ?? "-",
          "jam-pulang": el.absensi?.selasa?.pulang.jam ?? "-",
        },
        rabu: {
          tanggal: el.absensi?.rabu?.hadir?.tanggal ?? "-",
          "jam-hadir": el.absensi?.rabu?.hadir?.jam ?? "-",
          status: el.absensi?.rabu?.hadir?.status ?? "-",
          "jam-pulang": el.absensi?.rabu?.pulang.jam ?? "-",
        },
        kamis: {
          tanggal: el.absensi?.kamis?.hadir?.tanggal ?? "-",
          "jam-hadir": el.absensi?.kamis?.hadir?.jam ?? "-",
          status: el.absensi?.kamis?.hadir?.status ?? "-",
          "jam-pulang": el.absensi?.kamis?.pulang.jam ?? "-",
        },
        jumat: {
          tanggal: el.absensi?.jumat?.hadir?.tanggal ?? "-",
          "jam-hadir": el.absensi?.jumat?.hadir?.jam ?? "-",
          status: el.absensi?.jumat?.hadir?.status ?? "-",
          "jam-pulang": el.absensi?.jumat?.pulang.jam ?? "-",
        },
        sabtu: {
          tanggal: el.absensi?.sabtu?.hadir?.tanggal ?? "-",
          "jam-hadir": el.absensi?.sabtu?.hadir?.jam ?? "-",
          status: el.absensi?.sabtu?.hadir?.status ?? "-",
          "jam-pulang": el.absensi?.sabtu?.pulang.jam ?? "-",
        },
      };
    });

    let laporanCSV =
      "id,nama,kelas,senin,,,,selasa,,,,rabu,,,,kamis,,,,jumat,,,,sabtu,,,,\n";
    laporanCSV +=
      ",,," + "tanggal,jam-hadir,status,jam-pulang,".repeat(6) + "\n";
    laporanJSON.forEach((el) => {
      laporanCSV += `"${el.id}","${el.nama}","${el.kelas}","${el.senin.tanggal}","${el.senin["jam-hadir"]}","${el.senin.status}","${el.senin["jam-pulang"]}","${el.selasa.tanggal}","${el.selasa["jam-hadir"]}","${el.selasa.status}","${el.selasa["jam-pulang"]}","${el.rabu.tanggal}","${el.rabu["jam-hadir"]}","${el.rabu.status}","${el.rabu["jam-pulang"]}","${el.kamis.tanggal}","${el.kamis["jam-hadir"]}","${el.kamis.status}","${el.senin["jam-pulang"]}","${el.jumat.tanggal}","${el.jumat["jam-hadir"]}","${el.jumat.status}","${el.jumat["jam-pulang"]}","${el.sabtu.tanggal}","${el.sabtu["jam-hadir"]}","${el.sabtu.status}","${el.sabtu["jam-pulang"]}",\n`;
    });
    let nameFile = join(process.cwd(), "report", `${Date.now()}`);

    if (!fs.existsSync(join(process.cwd(), "report"))) {
      fs.mkdirSync(join(process.cwd(), "report"));
    }

    fs.writeFileSync(`${nameFile}.csv`, laporanCSV);

    return {
      name_file: `${nameFile}.csv`,
      file: fs.readFileSync(`${nameFile}.csv`),
    };
    // form.append(file, "");
  }
}

export default Controller;
