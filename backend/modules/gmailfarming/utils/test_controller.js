var path = require("path");
const puppeteer = require("puppeteer-extra");
const console = require("../../../utils/logger");

const stealth = require("puppeteer-extra-plugin-stealth");
puppeteer.use(stealth());

const { uuid, gmail, pass, proxy, recovery, security, type, group } =
  JSON.parse(process.argv[2]);

const humanTyping = async (element, word, page) => {
  for (let i = 0; i < word.length; i++) {
    await page.type(element, word.charAt(i));
    await page.waitFor(100);
  }
};

const login = async () => {
  try {
    var browser;
    if (proxy !== "localhost") {
      browser = await puppeteer.launch({
        headless: false,
        executablePath:
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        args: [
          "--proxy-server=" + proxy.split(":")[0] + ":" + proxy.split(":")[1],
        ],
      });
    } else {
      browser = await puppeteer.launch({
        headless: false,
        executablePath:
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      });
    }
    const page = await browser.newPage();
    if (
      proxy !== "localhost" &&
      proxy.indexOf(":") !== proxy.lastIndexOf(":")
    ) {
      await page.authenticate({
        username: proxy.split(":")[2],
        password: proxy.split(":")[3],
      });
    }
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36"
    );
    const navigationPromise = page.waitForNavigation();

    await page.goto("https://accounts.google.com/");

    await navigationPromise;

    await page.waitForSelector('input[type="email"]');
    await page.click('input[type="email"]');

    await navigationPromise;

    await humanTyping('input[type="email"]', gmail, page);

    await page.waitForSelector("#identifierNext");
    await page.click("#identifierNext");

    await page.waitFor(500);
    let emailHTML = await page.evaluate(() => document.body.innerHTML);
    if (emailHTML.includes("Couldn't find your Google Account")) {
      console.log("couldnt find acc", "debug");
      browser.close();
      parentPort.postMessage({
        id: uuid,
        errors: "Invalid Email",
        message: "Email Invalid! Stopping.",
      });
    }

    await page.waitForSelector(
      "#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input"
    );
    await page.click('input[type="email"]');
    await page.waitFor(500);

    await humanTyping('input[type="password"]', pass, page);
    await page.waitForSelector("#passwordNext");
    await page.click("#passwordNext");

    await page.waitFor(2500);
    emailHTML = await page.evaluate(() => document.body.innerHTML);
    if (emailHTML.includes("Wrong password.")) {
      browser.close();
      parentPort.postMessage({
        id: uuid,
        errors: "Password Incorrect",
        message: "Incorrect Password! Stopping.",
      });
    }

    if (page.url().includes("https://myaccount.google.com/")) {
      console.log("Login Successful!", "info");
      // runFlow({
      //     "browser": browser,
      //     "page": page
      // })
      return {
        browser: browser,
        page: page,
      };
    } else {
      let bodyHTML = await page.evaluate(() => document.body.innerHTML);

      //TODO: add recovery email/question
      if (bodyHTML.includes("2-Step Verification")) {
        console.log("2FA Decected. Manual Login Required.", "info");
        await page.waitForNavigation();
        if (page.url().includes("myaccount.google.com")) {
          // runFlow({
          //     "browser": browser,
          //     "page": page
          // })
          return {
            browser: browser,
            page: page,
          };
        } else {
          console.log("something went wrong! aborting", "error");
          throw new Error("Login Error Occured.");
        }
      } else if (bodyHTML.includes("Confirm your recovery email")) {
        await page.click(
          "#view_container > div > div > div.pwWryf.bxPAYd > div > div.WEQkZc > div > form > span > section > div > div > div > ul > li:nth-child(4) > div"
        );
        await humanTyping(
          "#knowledge-preregistered-email-response",
          recovery,
          page
        );
        await page.waitForNavigation();
        if (page.url().includes("https://myaccount.google.com/")) {
          // runFlow({
          //     "browser": browser,
          //     "page": page
          // })
          return {
            browser: browser,
            page: page,
          };
        }
      } else if (bodyHTML.includes("Protect your account")) {
        await page.click(
          "#yDmH0d > c-wiz.yip5uc.SSPGKf > c-wiz > div > div.p9lFnc > div > div > div > div.ZRg0lb.Kn8Efe > div:nth-child(3) > div > div.yKBrKe > div"
        );
        if (page.url().includes("https://myaccount.google.com/")) {
          // runFlow({
          //     "browser": browser,
          //     "page": page
          // })
          return {
            browser: browser,
            page: page,
          };
        }
      } else if (bodyHTML.includes("Answer your security question")) {
        if (
          (await page.$(
            "#view_container > div > div > div.pwWryf.bxPAYd > div > div.WEQkZc > div > form > span > section > div > div > div > ul > li:nth-child(1) > div"
          )) !== null
        ) {
          await page.click(
            "#view_container > div > div > div.pwWryf.bxPAYd > div > div.WEQkZc > div > form > span > section > div > div > div > ul > li:nth-child(1) > div"
          );
        }
        await page.waitForSelector("#secret-question-response");
        await humanTyping("#secret-question-response", security, page);
        await page.waitForNavigation();
        if (page.url().includes("https://myaccount.google.com/")) {
          // runFlow({
          //     "browser": browser,
          //     "page": page
          // })
          return {
            browser: browser,
            page: page,
          };
        }
      } else {
        browser.close();
        parentPort.postMessage({
          id: uuid,
          errors: null,
          message: "Manual Login Required!",
        });
      }
    }
  } catch (err) {
    console.log("Manual Login Required", err);
    if (browser) {
      browser.close();
    }
    parentPort.postMessage({
      id: uuid,
      errors: null,
      message: "Manual Login Required!",
    });
  }
};

//test v3
const testRecapV3 = async (page) => {
  await page.goto(
    "https://recaptcha-demo.appspot.com/recaptcha-v3-request-scores.php"
  );
  await page.waitForXPath('//*[@id="recaptcha-steps"]/li[4]/pre');
  let scoreElement = await page.$x('//*[@id="recaptcha-steps"]/li[4]/pre[1]');
  await page.waitFor(1500);
  let score1 = await page.evaluate((el) => el.textContent, scoreElement[0]);
  return JSON.parse(score1).score;
};

//Tests invis recapV2
const testCaptchaInvis = async (page) => {
  await page.goto(
    "https://recaptcha-demo.appspot.com/recaptcha-v2-invisible.php"
  );
  await page.waitForSelector("#demo-form > fieldset > button");
  await page.click("#demo-form > fieldset > button");
  let inHTML = await page.evaluate(() => document.body.innerHTML);
  if (inHTML.includes("Success!")) {
    console.log("One Click Successful!", "info");
    return true;
  } else {
    return false;
  }
};

//Tests regular recapV2
const testCaptchaV2 = async (page) => {
  await page.goto(
    "https://recaptcha-demo.appspot.com/recaptcha-v2-checkbox.php"
  );
  await page.waitForSelector(
    "#recaptcha-anchor > div.recaptcha-checkbox-border"
  );
  await page.click("#recaptcha-anchor > div.recaptcha-checkbox-checkmark");
  await page.click("body > main > form > fieldset > button");
  let inHTML = await page.evaluate(() => document.body.innerHTML);
  if (inHTML.includes("Something went wrong")) {
    return false;
  } else {
    return true;
  }
};

(async () => {
  const browserInfo = await login();
  if (type === "v3") {
    const score = await testRecapV3(browserInfo.page);
    console.log(score, "debug");
    process.stdout.write(
      JSON.stringify({
        score: score,
        uuid: uuid,
      })
    );
  } else if (type === "v2v") {
    const result = await testCaptchaV2(browserInfo.page);
    browserInfo.browser.close();
    process.stdout.write(
      JSON.stringify({
        score: result,
        uuid: uuid,
      })
    );
  } else if (type === "v2i") {
    const result = await testCaptchaInvis(browserInfo.page);
    browserInfo.browser.close();
    process.stdout.write(
      JSON.stringify({
        score: result,
        uuid: uuid,
      })
    );
  }
})();
