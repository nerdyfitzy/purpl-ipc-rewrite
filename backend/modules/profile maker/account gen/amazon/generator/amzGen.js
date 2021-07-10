const puppeteer = require("puppeteer-extra");
const stealth = require("puppeteer-extra-plugin-stealth");
const names = require("node-random-name");
puppeteer.use(stealth());
const fs = require("fs");
const path = require("path");
const ImageCaptcha = require("../../../../../utils/captcha/capmonster/types/imageCap");
const FunCaptcha = require("../../../../../utils/captcha/2captcha/types/funcaptcha");

const { getProfile } = require("../../../index");
const AmazonScanner = require("../../../../../utils/gmail scanning/site specific/amazonScanner");
const FiveSim = require("../../../../../utils/phone/5sim/5sim");
const Webhook = require("../../../../../utils/webhook");
const webhook = new Webhook();
const numbers = "1234567890";
class AmazonGenerator {
  constructor(catchall, profileId, groupID, smsKey, captchaKey) {
    this.fname;
    this.lname;
    this.email;
    this.password;
    // this.profile = getProfile(profileId, groupID);
    this.catchall = catchall;

    this.browser;
    this.page;
    this.emailScanner = new AmazonScanner();
    this.emailScanner.getOauth2();
    this.smsKey = smsKey;
    this.captchaKey = captchaKey;
  }

  newInfo() {
    this.fname = names({ first: true });
    this.lname = names({ last: true });
    this.email = `${this.fname}${this.lname}@${this.catchall}`;
    this.password =
      this.fname +
      this.lname +
      numbers.charAt(Math.random() * (numbers.length - 1));
  }

  async humanTyping(el, word) {}

  async setup() {
    const { global } = JSON.parse(
      fs.readFileSync(
        path.join(process.env.APPDATA, "purpl", "local-data", "config.json")
      )
    );
    console.log(global.chromePath);
    this.browser = await puppeteer.launch({
      headless: false,
      executablePath: global.chromePath,
    });

    this.page = await this.browser.newPage();

    return 1;
  }

  async start() {
    await this.setup();
    this.newInfo();
    this.fillInfo();
  }

  async fillInfo() {
    await this.page.goto("https://www.amazon.com/");
    await this.page.waitForSelector("#nav-link-accountList");
    await this.page.click("#nav-link-accountList");

    await this.page.waitForSelector("#createAccountSubmit");
    await this.page.click("#createAccountSubmit");

    await this.page.waitForSelector("#ap_customer_name");
    await this.page.focus("#ap_customer_name");
    await this.page.keyboard.type(this.fname + " " + this.lname);

    await this.page.waitFor(200);

    await this.page.focus("#ap_email");
    await this.page.keyboard.type(this.email);

    await this.page.waitFor(200);

    await this.page.focus("#ap_password");
    await this.page.keyboard.type(this.password);

    await this.page.waitFor(200);

    await this.page.focus("#ap_password_check");
    await this.page.keyboard.type(this.password);

    await this.page.waitFor(200);

    await this.page.click("#continue");
    await this.page.waitForNavigation();

    const url = await this.page.url();
    if (url === "https://www.amazon.com/ap/cvf/verify") {
      //imgcap
      const captchaLink = await this.page.$$eval(
        'img[alt="captcha"]',
        (captcha) => captcha.getAttribute("src")
      );
      console.log(captchaLink);
      const captchaPage = await this.browser.newPage();
      const src = await captchaPage.goto(captchaLink);
      captchaPage.close();
      const buff = src.buffer();
      const b64 = Buffer.from(buff).toString("base64");

      const ImgCap = new ImageCaptcha(this.captchaKey);
      ImgCap.reqCaptcha(b64);
    } else {
      //funcap
      const fcap = new FunCaptcha(this.captchaKey);
      const sol = await fcap.requestSolve(
        "2F1CD804-FE45-F12B-9723-240962EBA6F8",
        url,
        "https://api.arkoselabs.com"
      );

      await this.page.evaluate((sol) => {
        document.querySelector("#cvf_captcha_arkose_response_token").value =
          sol;
        document.querySelector("#cvf-arkose-captcha-form").submit();
      }, sol);
    }
    const now = Math.round(Date.now() / 1000);
    console.log(now);
    await this.page.waitForSelector("#cvf-input-code");
    await this.fillOTP(now);
  }

  async fillOTP(now) {
    const otp = await this.emailScanner.scanForOTP(now);
    console.log("got otp", otp);
    await this.page.focus("#cvf-input-code");
    await this.page.keyboard.type(otp);
    await this.page.click(
      `input[aria-labelledby="cvf-submit-otp-button-announce"]`
    );

    await this.page.waitForSelector(`input[name="cvf_phone_num"]`);

    await this.fillSMS();
  }

  async fillSMS() {
    const sms = new FiveSim(this.smsKey);
    const [num, id] = await sms.getNumber();
    console.log("received phone", num, id);

    await this.page.waitForSelector(`span[data-action="a-dropdown-button"]`);
    await this.page.click(`span[data-action="a-dropdown-button"]`);

    await this.page.waitForSelector(`a[data-value='{"stringVal":"RU"}']`);
    await this.page.click(`a[data-value='{"stringVal":"RU"}']`);

    await this.page.focus(`input[name="cvf_phone_num"]`);
    await this.page.keyboard.type(num.substring(2));

    await this.page.click(`input[name="cvf_action"]`);

    await this.page.waitForSelector(`input[name="code"]`);

    sms
      .checkOrder(id)
      .then(async (code) => {
        await this.page.focus(`input[name="code"]`);
        await this.page.keyboard.type(code);
      })
      .catch(async (err) => {
        console.log(err);
        await this.page.click(`a[data-value="resend"]`);
        const code = await sms.checkOrder(id);
        await this.page.focus(`input[name="code"]`);
        await this.page.keyboard.type(code);
      });

    await this.page.click(`input[name="cvf_action"]`);

    webhook.send({
      content: null,
      embeds: [
        {
          title: "Successfully Generated Account!",
          color: 2563729,
          fields: [
            {
              name: "Site",
              value: "Amazon",
              inline: true,
            },
            {
              name: "Email",
              value: `||${this.email}||`,
              inline: true,
            },
            {
              name: "SMS Country",
              value: "Russia",
              inline: true,
            },
          ],
          footer: {
            text: "purpl automation",
            icon_url:
              "https://pbs.twimg.com/profile_images/1329240390537342976/uDaF1oYc_400x400.jpg",
          },
        },
      ],
    });
  }

  end() {
    if (typeof this.browser === "undefined") return;
    this.browser.close();
  }
}

// (async () => {
//     const browser = await puppeteer.launch({
//       headless: false,
//     });
//     const page = await browser.newPage();
//     const link =
//       "https://opfcaptcha-prod.s3.amazonaws.com/2e332e57d5c24fdabcdafc9904d4d6c7.gif?AWSAccessKeyId=AKIA5WBBRBBB6BTXNN5K&Expires=1624405865&Signature=3iGcVIiLc2d%2BrMvLBGlFeq4HZV4%3D";
//     const src = await page.goto(link);
//     console.log("src", src);
//     const buff = await src.buffer();
//     console.log("buff", buff);
//     const b64 = Buffer.from(buff).toString("base64");
//     console.log(b64);

//     const ImgCap = new ImageCaptcha("92349dfe8d219b755c9cda064e392421");

//     const sol = await ImgCap.reqCaptcha(b64);
//     console.log(sol);
// })();

const Gen = new AmazonGenerator(
  "fitzynike.com",
  "84f9338b-76ed-42fa-a378-a190618558d6",
  "d9fdb513-5606-452f-8d10-e2852e9fb88f",
  "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NTY4MTQ4MTMsImlhdCI6MTYyNTI3ODgxMywicmF5IjoiYmJmODg3M2MxZjE0M2I0YmVmNzAyYjQyZjg4OWRhMmMiLCJzdWIiOjY2NzMxMn0.KM469yhtcAl9WwylYhzR2pu9voQJg_dqwk0afWehB4uGcdw3647vN_-Z_xFt4l-dudG6hv2d7WfS1u4Y17mOHVSv3_h_wJrAXQQaWOcGC-SXOObDvznbiYhNr0SMtsi0AIdxmnCV-LlRaDxaV5_bmc8MGeEgK7W6aXmjCpg88XYO5Md7KwAVYCB-94tQ5gx-7JbvynGJoMfb2OsSgCbYa0Gj-ixMf1YnPXFpyTA1WhWO9qEWFwg1ML1QSKrkEW8_Nw12o5r35HOvtA3lcdcmaaTM4wJ3M9Za24GTL9qQx6hW1hIsKIL4z43lqgntPqLTBV-QzQn0Raqa8K3fIemuEw",
  "252dce3ca29598c726c27083980e6e2c"
);
Gen.start();
