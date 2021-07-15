const puppeteer = require("puppeteer-extra");
const stealth = require("puppeteer-extra-plugin-stealth");
const names = require("node-random-name");
puppeteer.use(stealth());
const fs = require("fs");
const path = require("path");
const ImageCaptcha = require("../../../../../utils/captcha/capmonster/types/imageCap");
const FunCaptcha = require("../../../../../utils/captcha/2captcha/types/funcaptcha");

const AmazonScanner = require("../../../../../utils/gmail scanning/site specific/amazonScanner");
const FiveSim = require("../../../../../utils/phone/5sim/5sim");
const Webhook = require("../../../../../utils/webhook");
const numbers = "1234567890";
const { getProfile } = require("../../../index");

class AmazonGenerator {
  constructor(catchall, profileId, groupID, smsKey, captchaKey) {
    this.fname;
    this.lname;
    this.email;
    this.password;
    // this.profile = getProfile(profileId, groupID);
    this.catchall = catchall;
    this.webhook = new Webhook();

    this.browser;
    this.page;
    this.emailScanner = new AmazonScanner();
    this.emailScanner.getOauth2();
    this.smsKey = smsKey;
    this.captchaKey = captchaKey;

    this.profileId = profileId;
    this.groupID = groupID;
  }

  newInfo() {
    this.fname = names({ first: true });
    this.lname = names({ last: true });
    this.email = `${this.fname}${this.lname}${this.catchall}`;
    this.password =
      this.fname +
      this.lname +
      numbers.charAt(Math.random() * (numbers.length - 1));
  }

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

  sendWebhook() {
    this.webhook.send({
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

  async getProfileInfo() {
    const prof = await getProfile(this.profileId, this.groupID);
    console.log("got", prof);
    return prof;
  }

  async start() {
    try {
      await this.setup();
      this.newInfo();
      const now = await this.fillInfo();
      await this.fillOTP(now);
      await this.fillSMS();
      this.sendWebhook();

      await this.addProfileInfo();
      await this.addCardInfo();

      this.end();

      return `${this.email}:${this.password}`;
    } catch (e) {
      console.log(e, "error");
      return false;
    }
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
    return now;
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

    return 1;
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

    return 1;
  }

  async addProfileInfo() {
    await this.page.goto(
      "https://www.amazon.com/a/addresses/add?ref=ya_address_book_add_button"
    );

    if ((await this.page.$("#ap_password")) !== null) {
      await this.page.focus("#ap_password");
      await this.page.keyboard.type(this.password);
      await this.page.click(`input[name="rememberMe"]`);
      await this.page.click("#signInSubmit");
    }

    await this.page.waitForSelector(
      `input[name="address-ui-widgets-enterAddressFullName"]`
    );

    const { shipping } = await this.getProfileInfo();
    await this.page.focus(
      `input[name="address-ui-widgets-enterAddressFullName"]`
    );
    await this.page.keyboard.type(shipping.name);

    await this.page.focus("#address-ui-widgets-enterAddressPhoneNumber");
    await this.page.keyboard.type(shipping.phone);

    await this.page.focus("#address-ui-widgets-enterAddressLine1");
    await this.page.keyboard.type(shipping.addy1);

    await this.page.click(`#awz-address-suggestion-0`);

    await this.page.focus("#address-ui-widgets-enterAddressLine2");
    await this.page.keyboard.type(shipping.addy2);

    await this.page.click("#address-ui-widgets-use-as-my-default");

    await this.page.click(
      `input[aria-labelledby="address-ui-widgets-form-submit-button-announce"]`
    );

    await this.page.waitForNavigation();
    if ((await this.page.$("#ap_password")) !== null) {
      await this.page.focus("#ap_password");
      await this.page.keyboard.type(this.password);
      await this.page.click(`input[name="rememberMe"]`);
      await this.page.click("#signInSubmit");
    }
    return 1;
  }

  async addCardInfo() {
    await this.page.goto(
      "https://www.amazon.com/cpe/yourpayments/wallet?ref_=ya_d_l_pmt_mpo"
    );
    const { payment } = await this.getProfileInfo();
    await this.page.click("#apx-add-credit-card-action-test-id");

    await this.page.waitForSelector(`input[name="addCreditCardNumber"]`);

    await this.page.focus(`input[name="addCreditCardNumber"]`);
    await this.page.keyboard.type(payment.cnb);

    await this.page.focus(`input[name="ppw-accountHolderName"]`);
    await this.page.keyboard.type(payment.name);

    await this.page.click(`select[name="ppw-expirationDate_month"]`);
    await this.page.waitForSelector(`a[data-value='{"stringVal":"5"}']`);
    await this.page.click(
      `a[data-value='{"stringVal":"${payment.month.substring(1)}"}']`
    );

    await this.page.click(`select[name="ppw-expirationDate_year"]`);
    await this.page.waitForSelector(`a[data-value='{"stringVal":"2026"}']`);
    await this.page.click(`a[data-value='{"stringVal":"20${payment.year}"}']`);

    if (
      (await this.page.$(
        `input[name="ppw-widgetEvent:SelectAddressEvent"]`
      )) !== null
    )
      await this.page.click(`input[name="ppw-widgetEvent:SelectAddressEvent"]`);

    return 1;
  }

  end() {
    if (typeof this.browser === "undefined") return;
    this.browser.close();
  }
}

module.exports = AmazonGenerator;
