const got = require("got");
const FunCaptcha = require("./types/funcaptcha");

class TwoCaptcha {
  constructor(key) {
    this.key = key;
  }

  async getCaptchaResponse(taskId, key) {
    return new Promise(async (resolve, reject) => {
      const inter = setInterval(async () => {
        console.log("Getting status of", taskId);
        const res = await got.get("http://2captcha.com/res.php", {
          searchParams: {
            key,
            action: "get",
            id: taskId,
            json: 1,
          },
          responseType: "json",
        });

        console.log(res.body);
        if (res.body.status === 1) {
          clearInterval(inter);
          resolve(res.body.request);
        } else if (res.body.request === "ERROR_CAPTCHA_UNSOLVABLE") {
          clearInterval(inter);
          reject("Unsolvable");
        }
      }, 5000);
    });
  }
}

module.exports = TwoCaptcha;
