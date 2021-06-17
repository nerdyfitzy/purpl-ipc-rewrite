const puppeteer = require("puppeteer-extra");
const stealth = require("puppeteer-extra-plugin-stealth");
const parseCookies = require("./parseCookies");
const got = require("got");
const path = require("path");
const console = require("../../../utils/logger");

const fs = require("fs");

puppeteer.use(stealth());

const humanTyping = async (element, word, page) => {
  for (let i = 0; i < word.length; i++) {
    await page.type(element, word.charAt(i));
    await page.waitFor(100);
  }
};

const getLevel = async (CREDENTIALS_AND_COOKIES) => {
  const { jar, token } = await parseCookies(CREDENTIALS_AND_COOKIES);
  console.log(jar + " " + token);
  const res = await got.get("https://stockx.com/api/users/me/rewards", {
    jar,
    headers: {
      authority: "stockx.com",
      appos: "web",
      "x-requested-with": "XMLHttpRequest",
      authorization: `Bearer ${token}`,
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Safari/537.36",
      appversion: "0.1",
      accept: "*/*",
      "sec-gpc": "1",
      "sec-fetch-site": "same-origin",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      referer: `https://stockx.com/account`,
      "accept-language": "en-US,en;q=0.9",
    },
    responseType: "json",
  });
  const { level, fee } = res.body.data[0].attributes.level.current;
  CREDENTIALS_AND_COOKIES.selling.fee = level;
  CREDENTIALS_AND_COOKIES.selling.level = fee / 100;
  fs.writeFileSync(
    path.join(process.env.APPDATA, "purpl", "local-data", "session.json"),
    JSON.stringify({
      CREDENTIALS_AND_COOKIES,
    })
  );
  return;
};

const login = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath:
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  });

  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on("request", async (request) => {
    if (
      request.url() === "https://accounts.stockx.com/usernamepassword/login"
    ) {
      //console.log(request)
      const { username, password } = JSON.parse(request._postData);
      request.continue();
      console.log(username + " " + password);
      await page.waitForNavigation();
      const cookies = await page.cookies();

      const CREDENTIALS_AND_COOKIES = {
        cookies,
        credentials: {
          email: username,
          pass: password,
        },
        selling: {
          fee: 0,
          level: 0,
        },
      };
      return getLevel(CREDENTIALS_AND_COOKIES);
    } else {
      request.continue();
    }
  });

  await page.goto("https://accounts.stockx.com/login");
};

module.exports = {
  login: login,
};
