const puppeteer = require("puppeteer-extra");
const stealth = require("puppeteer-extra-plugin-stealth");
const names = require("node-random-name");
puppeteer.use(stealth());
const fs = require("fs");
const path = require("path");
const ImageCaptcha = require("../../../../../utils/captcha/types/imageCap");
const FunCaptcha = require("../../../../../utils/captcha/types/funCaptcha");

const { getProfile } = require("../../../index");

const numbers = "1234567890";
class AmazonGenerator {
  constructor(catchall, profileId, groupID) {
    this.fname;
    this.lname;
    this.email;
    this.password;
    // this.profile = getProfile(profileId, groupID);
    this.catchall = catchall;

    this.browser;
    this.page;
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

      const ImgCap = new ImageCaptcha("92349dfe8d219b755c9cda064e392421");
      ImgCap.reqCaptcha(b64);
    } else {
      //funcap
      const FunCap = new FunCaptcha("92349dfe8d219b755c9cda064e392421");
      FunCap.reqCaptcha("92349dfe8d219b755c9cda064e392421", url);
    }

    const twoFACheck = await this.page.$("#cvf-input-code");
    if (twoFACheck !== undefined) {
      //get 2fa w/ email scanning

      await this.page.click(
        `input[aria-labelledby="cvf-submit-otp-button-announce"]`
      );
    }
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
  "d9fdb513-5606-452f-8d10-e2852e9fb88f"
);
Gen.start();
