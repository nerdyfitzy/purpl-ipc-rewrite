const got = require("got");

class FiveSim {
  token;
  taskId;
  constructor(key) {
    this.token = key;
  }

  async checkOrder(id) {
    return new Promise(async (resolve, reject) => {
      console.log("CHECKING ORDEr!!!!");
      const res = await got.get(`https://5sim.net/v1/user/check/${id}`, {
        headers: {
          authorization: `Bearer ${this.token}`,
          accept: "application/json",
        },
        responseType: "json",
      });
      if (res.body.status === "RECEIVED") {
        console.log("received", res.body);
        if (typeof res.body.sms[0] === "undefined") {
          reject("re-send");
        } else {
          resolve(res.body.sms[0].code);
        }
      } else {
        setTimeout(async () => {
          resolve(await this.checkOrder(id));
        }, 2000);
      }
    });
  }

  async getNumber() {
    console.log("Getting number");
    const res = await got.get(
      `https://5sim.net/v1/user/buy/activation/russia/any/amazon`,
      {
        headers: {
          authorization: `Bearer ${this.token}`,
          accept: "application/json",
        },
        responseType: "json",
      }
    );

    return [res.body.phone, res.body.id];
  }
}

module.exports = FiveSim;
