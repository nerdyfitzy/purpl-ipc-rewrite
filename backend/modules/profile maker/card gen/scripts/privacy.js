const got = require("got");
const puppeteer = require("puppeteer");

class Privacy {
  constructor() {
    this.api_key;
    this.page;
    this.context;
  }

  getApiKey() {
    return new Promise(async (resolve, reject) => {
      const browser = await puppeteer.launch({
        headless: false,
        executablePath:
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      });
      const page = await browser.newPage();
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        if (
          request.url() === "https://privacy.com/api/v1/event/" &&
          request._headers.authorization
        ) {
          console.log(
            "We got da keyeyahsdasdasdsd",
            request._headers.authorization
          );
          this.api_key = request._headers.authorization;
          resolve(this.api_key);
        }

        request.continue();
      });
      await page.goto("https://privacy.com/login");
    });
  }

  async makeCards(name) {
    try {
      console.log("Making Card");
      const { body } = await got.post("https://privacy.com/api/v1/card", {
        responseType: "json",
        headers: {
          Connection: "keep-alive",
          Accept: "application/json, text/plain, */*",
          Authorization: this.api_key,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.101 Safari/537.36",
          "Content-Type": "application/json;charset=UTF-8",
          "Sec-GPC": "1",
          Origin: "https://privacy.com",
          "Sec-Fetch-Site": "same-origin",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Dest": "empty",
          Referer: "https://privacy.com/home",
          "Accept-Language": "en-US,en;q=0.9",
        },
        json: {
          type: "MERCHANT_LOCKED",
          spendLimitDuration: "MONTHLY",
          unused: true,
          style: null,
          memo: name,
          meta: {
            hostname: "",
          },
        },
      });
      const { pan, expMonth, expYear, cvv, memo } = body.card;
      return {
        cardDetails: {
          cardNumber: pan,
          expMonth: expMonth,
          expYear: expYear,
          cvv: cvv,
        },
        name: memo,
        site_locked: "UNUSED",
      };
    } catch (e) {
      console.log(e, "error");
    }
  }

  async getCards() {
    try {
      const privacyCards = new Array();
      const { body } = await got.get("https://privacy.com/api/v1/card/", {
        responseType: "json",
        headers: {
          Connection: "keep-alive",
          Accept: "application/json, text/plain, */*",
          Authorization: this.api_key.includes("Bearer")
            ? this.api_key
            : `Bearer ${this.api_key}`,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.101 Safari/537.36",
          "Content-Type": "application/json;charset=UTF-8",
          "Sec-GPC": "1",
          Origin: "https://privacy.com",
          "Sec-Fetch-Site": "same-origin",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Dest": "empty",
          Referer: "https://privacy.com/home",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
      body.cardList.forEach((card) => {
        privacyCards.push({
          cardDetails: {
            cardNumber: card.PAN,
            expMonth: card.expMonth,
            expYear: card.expYear,
            cvv: card.CVV,
          },
          name: card.memo,
          site_locked: card.style ? card.style.hostname : "UNUSED",
        });
      });
      return privacyCards;
    } catch (e) {
      console.log(e, "error");
    }
  }
}

module.exports = Privacy;
