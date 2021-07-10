const got = require("got");
const fs = require("fs");
const path = require("path");
const console = require("./logger");

class Webhook {
  constructor() {
    const temp = fs.readFileSync(
      path.join(process.env.APPDATA, "purpl", "local-data", "config.json")
    );
    const { global } = JSON.parse(temp);
    this.hook = global.webhook;
  }

  async send(data) {
    if (this.hook === "") return;
    try {
      const res = await got.post(this.hook, {
        headers: {
          "content-type": "application/json",
        },
        json: data,
      });
    } catch (e) {
      console.log(e, "error");
    }
  }
}

module.exports = Webhook;
