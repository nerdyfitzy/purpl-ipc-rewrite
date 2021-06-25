const Capmonster = require("../capmonster");
const got = require("got");

class FunCaptcha extends Capmonster {
  constructor(key) {
    super(key);
  }

  async reqCaptcha(key, url) {
    return new Promise(async (resolve, reject) => {
      try {
        const { body } = await got.post(
          "https://api.capmonster.cloud/createTask",
          {
            headers: {
              "content-type": "application/json",
            },
            json: {
              clientKey: key,
              task: {
                type: "FunCaptchaTaskProxyless",
                websiteURL: url,
                websitePublicKey: "2F1CD804-FE45-F12B-9723-240962EBA6F8",
              },
            },
            responseType: "json",
          }
        );
        const taskID = body.taskId;
        console.log(body);
        setTimeout(async () => {
          console.log("Asking for Solution");
          const solution = await this.getCaptchaStatus(key, taskID);
          console.log("Got solution");
          resolve(solution);
        }, 15000);
      } catch (e) {
        console.log(e);
      }
    });
  }
}

module.exports = FunCaptcha;
