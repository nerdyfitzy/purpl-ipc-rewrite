const GmailScanner = require("../auth");
const { google } = require("googleapis");
const console = require("../../../utils/logger");

class AmazonScanner extends GmailScanner {
  lastChecked;
  lastOTP;
  constructor() {
    super();
    this.lastChecked = 0;
    this.lastOTP = "";
  }

  getNewOTP(gmail) {
    return new Promise((resolve, reject) => {
      const inter = setInterval(async () => {
        console.log("Scanning");
        gmail.users.messages.list(
          {
            userId: "me",
            q:
              this.lastChecked === 0
                ? `from:(account-update@amazon.com)`
                : `from:(account-update@amazon.com) after:${this.lastChecked}`,
            includeSpamTrash: true,
          },
          (err, res) => {
            if (err) console.log(err, "error");
            if (res.data.messages) {
              gmail.users.messages.get(
                {
                  userId: "me",
                  id: res.data.messages[0].id,
                  format: 3,
                },
                async (err, res) => {
                  if (err) console.log(err, "error");
                  if (
                    res.data.snippet
                      .toLowerCase()
                      .includes("one time password (otp)")
                  ) {
                    const otp = res.data.snippet
                      .split("One Time Password (OTP): ")[1]
                      .split(" Do not")[0];
                    console.log(otp);
                    if (otp !== this.lastOTP) {
                      this.lastOTP = otp;
                      clearInterval(inter);
                      resolve(otp);
                    }
                  }
                }
              );
            }
          }
        );
      }, 5000);
    });
  }

  scanForOTP(now) {
    return new Promise(async (resolve, reject) => {
      if (!this.oauth2) await this.getOauth2();
      this.lastChecked = now;
      const gmail = google.gmail({ version: "v1", auth: this.oauth2 });
      const OTP_NEW = await this.getNewOTP(gmail);
      resolve(OTP_NEW);
    });
  }
}

module.exports = AmazonScanner;
