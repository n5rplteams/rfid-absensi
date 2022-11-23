import { ref, orderByChild, query, equalTo, get } from "firebase/database";

class Helper {
  constructor(Firebase, WAClient) {
    this.WA = WAClient;
    this.Firebase = Firebase;
  }

  async sendMessage(number, message) {
    try {
      await this.WA.sendMSG(number, message);
    } catch (err) {
      console.log(err);
    }
  }

  async getMode() {
    try {
      return await this.Firebase.getDB("mode");
    } catch (err) {
      return null;
    }
  }

  async cekId(tag) {
    if (tag) {
      try {
        let snapshot = await get(
          query(
            ref(this.Firebase.firebaseDb, "siswa"),
            orderByChild("id_card"),
            equalTo(tag)
          )
        );
        if (snapshot.exists()) {
          return snapshot;
        } else {
          return 404;
        }
      } catch (err) {
        console.log("Error cek", err);
        return 500;
      }
    } else {
      return 400;
    }
  }

  async addId(tag) {
    if (tag) {
      try {
        let mode = await this.getMode();
        let isAvailable = (
          await get(
            query(
              ref(this.Firebase.firebaseDb, "siswa"),
              orderByChild("id_card"),
              equalTo(tag)
            )
          )
        ).exists();
        if (!isAvailable && mode == 1) {
          try {
            await this.Firebase.updateDB(`new-card`, {
              id: tag,
            });
            return 201;
          } catch (err1) {
            console.log("Error add", err1);
            return 500;
          }
        } else {
          return 304;
        }
      } catch (err) {
        console.log("Error add", err);
        return 500;
      }
    } else {
      return 400;
    }
  }

  async absenId(tag, curr) {
    if (tag && curr) {
      try {
        let getQ = await get(
          query(
            ref(this.Firebase.firebaseDb, "siswa"),
            orderByChild("id_card"),
            equalTo(tag)
          )
        );
        if (getQ && this.getDay()) {
          let userId = Object.keys(getQ.val())[0];
          try {
            const date = new Date(curr);
            const statusAbsen = this.getStatusAbsen(date.getTime());
            console.log(Object.values(getQ.val())[0].absensi[this.getDay()]);
            if (statusAbsen == 1 || statusAbsen == -1) {
              if (
                Object.values(getQ.val())[0].absensi[this.getDay()].hadir.jam ==
                ""
              ) {
                await this.Firebase.updateDB(
                  `siswa/${userId}/absensi/${this.getDay()}/hadir`,
                  {
                    tanggal: `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`,
                    jam: `${date.getHours()}:${date.getMinutes()}`,
                    status:
                      statusAbsen == 1
                        ? "masuk-tepat"
                        : statusAbsen == -1
                        ? "masuk-telat"
                        : "",
                  }
                );
              } else {
                return 304;
              }
            }
            if (statusAbsen == 2) {
              if (
                Object.values(getQ.val())[0].absensi[this.getDay()].pulang
                  .jam == ""
              ) {
                await this.Firebase.updateDB(
                  `siswa/${userId}/absensi/${this.getDay()}/pulang`,
                  {
                    jam: `${date.getHours()}:${date.getMinutes()}`,
                    status: "pulang",
                  }
                );
              } else {
                return 304;
              }
            }
            return 200;
          } catch (error) {
            console.log("Error absen 2", error);
            return 500;
          }
        } else {
          return 404;
        }
      } catch (err) {
        console.log("Error absen 1", err);
        return 500;
      }
    } else {
      return 400;
    }
  }

  getStatusAbsen(currTime) {
    // Jam Kehadiran
    if (currTime >= this.getTime(5, 0) && currTime <= this.getTime(7, 30)) {
      // Masuk Tepat Waktu
      return 1;
    }
    if (currTime >= this.getTime(7, 31) && currTime <= this.getTime(12, 0)) {
      // Masuk Telat
      return -1;
    }
    if (currTime >= this.getTime(15, 30) && currTime <= this.getTime(20, 0)) {
      // Pulang
      return 2;
    }
  }

  getDay() {
    const days = [
      "minggu",
      "senin",
      "selasa",
      "rabu",
      "kamis",
      "jumat",
      "sabtu",
    ];
    const date = new Date();
    const d = date.getDay();
    if (d != 0 && d <= 5) {
      return days[d];
    } else {
      return null;
    }
  }

  getTime(hour, minute) {
    const date = new Date();
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hour,
      minute
    ).getTime();
  }
}

export default Helper;
