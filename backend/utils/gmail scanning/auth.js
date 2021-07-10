const fs = require("fs");
const path = require("path");
const got = require("got");
const { google } = require("googleapis");

class GmailScanner {
  gmailToken;
  oauth2;
  constructor() {
    const { misc } = JSON.parse(
      fs.readFileSync(
        path.join(process.env.APPDATA, "purpl", "local-data", "config.json")
      )
    );
    this.gmailToken =
      "4/1AX4XfWiGGXLQ9xdxzUnXeDvwETNOQHHolACx8IWLSalyvH4YbYdEt8BOQpo";
    this.oauth2 = false;
  }

  async getOauth2() {
    const res = await got.post("http://localhost:8080/oauth2", {
      headers: {
        "content-type": "application/json",
      },
      json: {
        code: this.gmailToken,
      },
      responseType: "json",
    });

    console.log(res.body);
    const { token, oAuth2Client } = res.body;
    this.oauth2 = new google.auth.OAuth2(
      oAuth2Client._clientId,
      oAuth2Client._clientSecret,
      oAuth2Client.redirectUri
    );
    this.oauth2.setCredentials(token);

    return 1;
  }
}

module.exports = GmailScanner;
