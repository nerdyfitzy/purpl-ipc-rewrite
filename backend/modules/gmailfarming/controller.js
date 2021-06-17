const { isMainThread, parentPort, workerData } = require("worker_threads");
//stop = 1
//manual login = 2
const tasks = require("./tasks");
const test = require("./utils/test");
const emails = require("./activities/email");
const youtube = require("./activities/youtube");
const news = require("./activities/news");
const google = require("./activities/google");
const images = require("./activities/images");
const subscribe = require("./activities/subscribe");
const puppeteer = require("puppeteer-extra");
const console = require("../../utils/logger");
const path = require("path");
const stealth = require("puppeteer-extra-plugin-stealth");
puppeteer.use(stealth());

//parentport message format
// {
//     "id": "TASK ID",
//     "errors": null or an error,
//     "message": "MESSAGE",
// }

const writeCookies = async (page) => {
  const client = await page.target().createCDPSession();
  // This gets all cookies from all URLs, not just the current URL
  const cookies = (await client.send("Network.getAllCookies"))["cookies"];

  console.log(`Saving ${cookies.length} cookies`, "debug");
  parentPort.postMessage({
    cookie: true,
    cookies: cookies,
    gmail: workerData.gmail.uuid,
    group: workerData.gmail.groupID,
    message: "",
  });
  return cookies;
};

const restoreCookies = async (page, cookies) => {
  try {
    // const cookies = await fs.readJSON(cookiesPath);
    // let buf = fs.readFileSync(cookiesPath);
    // let cookies = JSON.parse(buf);
    console.log(`Loading ${cookies.length} cookies into the browser`, "info");
    await page.setCookie(...cookies);
    console.log("Loaded cookies", "info");
  } catch (err) {
    console.log(err, "error");
  }
};

const humanTyping = async (element, word, page) => {
  for (let i = 0; i < word.length; i++) {
    await page.type(element, word.charAt(i));
    await page.waitFor(100);
  }
};

const loggedIn = async (page) => {
  if (page.url().includes("https://myaccount.google.com/")) {
    return true;
  } else {
    await page.waitForNavigation();
    return loggedIn(page);
  }
};

const runFlow = async (browserInfo) => {
  console.log(`sleeping in ${workerData.sleepIn}`, "debug");
  parentPort.postMessage({
    id: workerData.gmail.uuid,
    group: workerData.gmail.groupID,
    errors: null,
    message: "Subscribing To News",
  });
  await subscribe.subscribe(browserInfo.page, workerData.gmail.email);

  parentPort.postMessage({
    id: workerData.gmail.uuid,
    group: workerData.gmail.groupID,
    errors: null,
    message: "Checking Emails",
  });
  await emails.checkEmails(browserInfo.page);

  parentPort.postMessage({
    id: workerData.gmail.uuid,
    group: workerData.gmail.groupID,
    errors: null,
    message: "Sending Emails",
  });
  await emails.sendEmails(browserInfo.page);

  if (Date.now() >= workerData.sleepIn) {
    parentPort.postMessage({
      id: workerData.gmail.uuid,
      group: workerData.gmail.groupID,
      errors: null,
      message: "Sleeping",
    });
  }
  let choice = Math.floor(Math.random() * 9 + 1);
  if (choice > 5) {
    //read news
    parentPort.postMessage({
      id: workerData.gmail.uuid,
      group: workerData.gmail.groupID,
      errors: null,
      message: "Reading News",
    });
    await news.readNews(browserInfo.page);
  } else if (choice < 5) {
    //search google
    parentPort.postMessage({
      id: workerData.gmail.uuid,
      group: workerData.gmail.groupID,
      errors: null,
      message: "Searching Google",
    });
    await google.google(browserInfo.page);
  } else {
    parentPort.postMessage({
      id: workerData.gmail.uuid,
      group: workerData.gmail.groupID,
      errors: null,
      message: "Viewing Images",
    });
    await images.images(browserInfo.page);
  }

  //check sleep time
  if (Date.now() >= workerData.sleepIn) {
    parentPort.postMessage({
      id: workerData.gmail.uuid,
      group: workerData.gmail.groupID,
      errors: null,
      message: "Sleeping",
    });
  }

  if (!workerData.gmail.edu) {
    //watch youtube 1-2 vids
    parentPort.postMessage({
      id: workerData.gmail.uuid,
      group: workerData.gmail.groupID,
      errors: null,
      message: "Watching Youtube",
    });
    await youtube.watchYT(browserInfo.page);
  } else {
    //do google docs
    parentPort.postMessage({
      id: workerData.gmail.uuid,
      group: workerData.gmail.groupID,
      errors: null,
      message: "Writing Docs",
    });
    await docs.docs(browserInfo.page);
  }

  parentPort.postMessage({
    id: workerData.gmail.uuid,
    group: workerData.gmail.groupID,
    errors: null,
    message: "Sleeping",
    data: {},
  });
};

const login = async (browser, proxy) => {
  var page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36"
  );
  if (typeof proxy !== "undefined") {
    if (proxy.indexOf(":") != proxy.lastIndexOf(":")) {
      await page.authenticate({
        username: proxy.split(":")[2],
        password: proxy.split(":")[3],
      });
    }
  }
  if (typeof workerData.gmail.cookies !== "undefined") {
    await restoreCookies(page, workerData.gmail.cookies);
    await page.goto("https://accounts.google.com/");
    await page.waitFor(2000);
    if (
      (await page.$(
        "#view_container > div > div > div.pwWryf.bxPAYd > div > div.WEQkZc > div > form > span > section > div > div > div > div > ul > li.JDAKTe.ibdqA.W7Aapd.zpCp3.SmR8 > div"
      )) !== null
    ) {
      await page.click(
        "#view_container > div > div > div.pwWryf.bxPAYd > div > div.WEQkZc > div > form > span > section > div > div > div > div > ul > li.JDAKTe.ibdqA.W7Aapd.zpCp3.SmR8 > div"
      );
      await page.waitForSelector(
        "#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input"
      );
      await humanTyping(
        "#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input",
        workerData.gmail.password,
        page
      );
      await page.click("#passwordNext > div > button > div.VfPpkd-RLmnJb");
      await page.waitForNavigation();
      let emailHTML = await page.evaluate(() => document.body.innerHTML);
      if (emailHTML.includes("Wrong password.")) {
        parentPort.postMessage({
          id: workerData.gmail.uuid,
          group: workerData.gmail.groupID,
          errors: null,
          message: "Incorrect Password! Stopping.",
        });
        browser.close();
        parentPort.postMessage({
          id: workerData.gmail.uuid,
          group: workerData.gmail.groupID,
          message: "stop",
        });
      }

      if (page.url().includes("https://myaccount.google.com/")) {
        console.log("Login Successful!", "info");

        writeCookies(page);
        runFlow({
          browser: browser,
          page: page,
        });
      } else {
        let bodyHTML = await page.evaluate(() => document.body.innerHTML);

        if (bodyHTML.includes("2-Step Verification")) {
          console.log("2FA Decected. Manual Login Required.", "info");
          await page.waitForNavigation();
          if (page.url().includes("myaccount.google.com")) {
            writeCookies(page);
            runFlow({
              browser: browser,
              page: page,
            });
          } else {
            console.log("login error", "error");
            throw new Error("Login Error Occured.");
          }
        } else if (bodyHTML.includes("Confirm your recovery email")) {
          await page.click(
            "#view_container > div > div > div.pwWryf.bxPAYd > div > div.WEQkZc > div > form > span > section > div > div > div > ul > li:nth-child(4) > div"
          );
          await page.waitForSelector("#knowledge-preregistered-email-response");
          await humanTyping(
            "#knowledge-preregistered-email-response",
            workerData.gmail.recovery,
            page
          );
          await page.click(
            "#view_container > div > div > div.pwWryf.bxPAYd > div > div.zQJV3 > div > div.qhFLie > div > div > button > div.VfPpkd-RLmnJb"
          );
          await page.waitForNavigation();
          if (page.url().includes("https://myaccount.google.com/")) {
            writeCookies(page);
            runFlow({
              browser: browser,
              page: page,
            });
          } else {
            throw new Error(
              "Login Error Occured (probably requires phone code)"
            );
          }
        } else if (bodyHTML.includes("Protect your account")) {
          await page.click(
            "#yDmH0d > c-wiz.yip5uc.SSPGKf > c-wiz > div > div.p9lFnc > div > div > div > div.ZRg0lb.Kn8Efe > div:nth-child(3) > div > div.yKBrKe > div"
          );
          if (page.url().includes("https://myaccount.google.com/")) {
            writeCookies(page);
            runFlow({
              browser: browser,
              page: page,
            });
          } else {
            throw new Error(
              "Login Error Occured (probably requires phone code)"
            );
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
          await humanTyping(
            "#secret-question-response",
            workerData.gmail.security,
            page
          );
          await page.waitForNavigation();
          if (page.url().includes("https://myaccount.google.com/")) {
            writeCookies(page);
            runFlow({
              browser: browser,
              page: page,
            });
          } else {
            throw new Error(
              "Login Error Occured (probably requires phone code)"
            );
          }
        } else {
          browser.close();
          parentPort.postMessage({
            id: workerData.gmail.uuid,
            group: workerData.gmail.groupID,
            errors: null,
            message: "Manual Login Required!",
          });
        }
      }
    } else {
      runFlow({
        browser: browser,
        page: page,
      });
    }
  } else {
    const navigationPromise = page.waitForNavigation();
    parentPort.postMessage({
      id: workerData.gmail.uuid,
      group: workerData.gmail.groupID,
      errors: null,
      message: "Logging in...",
    });
    await page.goto("https://accounts.google.com/");

    await navigationPromise;

    await page.waitForSelector('input[type="email"]');
    await page.click('input[type="email"]');

    await navigationPromise;

    await humanTyping('input[type="email"]', workerData.gmail.email, page);

    await page.waitForSelector("#identifierNext");
    await page.click("#identifierNext");

    await page.waitFor(500);
    let emailHTML = await page.evaluate(() => document.body.innerHTML);
    if (emailHTML.includes("Couldn't find your Google Account")) {
      console.log("couldnt find acc", "error");
      parentPort.postMessage({
        id: workerData.gmail.uuid,
        group: workerData.gmail.groupID,
        errors: "Invalid Email",
        message: "Email Invalid! Stopping.",
      });
      browser.close();
      parentPort.postMessage({
        id: workerData.gmail.uuid,
        group: workerData.gmail.groupID,
        message: "stop",
      });
    }

    await page.waitForSelector(
      "#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input"
    );
    await page.click('input[type="email"]');
    await page.waitFor(500);

    await humanTyping(
      'input[type="password"]',
      workerData.gmail.password,
      page
    );
    await page.waitForSelector("#passwordNext");
    await page.click("#passwordNext");

    await page.waitFor(2500);
    emailHTML = await page.evaluate(() => document.body.innerHTML);
    if (emailHTML.includes("Wrong password.")) {
      parentPort.postMessage({
        id: workerData.gmail.uuid,
        group: workerData.gmail.groupID,
        errors: null,
        message: "Incorrect Password! Stopping.",
      });
      browser.close();
      parentPort.postMessage({
        id: workerData.gmail.uuid,
        group: workerData.gmail.groupID,
        message: "stop",
      });
    }

    if (page.url().includes("https://myaccount.google.com/")) {
      console.log("Login Successful!", "info");

      writeCookies(page);
      runFlow({
        browser: browser,
        page: page,
      });
    } else {
      let bodyHTML = await page.evaluate(() => document.body.innerHTML);

      if (bodyHTML.includes("2-Step Verification")) {
        console.log("2FA Decected. Manual Login Required.", "info");
        await page.waitForNavigation();
        if (page.url().includes("myaccount.google.com")) {
          writeCookies(page);
          runFlow({
            browser: browser,
            page: page,
          });
        } else {
          console.log("something went wrong! aborting", "error");
          throw new Error("Login Error Occured.");
        }
      } else if (bodyHTML.includes("Confirm your recovery email")) {
        await page.click(
          "#view_container > div > div > div.pwWryf.bxPAYd > div > div.WEQkZc > div > form > span > section > div > div > div > ul > li:nth-child(4) > div"
        );
        await page.waitForSelector("#knowledge-preregistered-email-response");
        await humanTyping(
          "#knowledge-preregistered-email-response",
          workerData.gmail.recovery,
          page
        );
        await page.click(
          "#view_container > div > div > div.pwWryf.bxPAYd > div > div.zQJV3 > div > div.qhFLie > div > div > button > div.VfPpkd-RLmnJb"
        );
        await page.waitForNavigation();
        if (page.url().includes("https://myaccount.google.com/")) {
          writeCookies(page);
          runFlow({
            browser: browser,
            page: page,
          });
        } else {
          throw new Error("Login Error Occured (probably requires phone code)");
        }
      } else if (bodyHTML.includes("Protect your account")) {
        await page.click(
          "#yDmH0d > c-wiz.yip5uc.SSPGKf > c-wiz > div > div.p9lFnc > div > div > div > div.ZRg0lb.Kn8Efe > div:nth-child(3) > div > div.yKBrKe > div"
        );
        if (page.url().includes("https://myaccount.google.com/")) {
          writeCookies(page);
          runFlow({
            browser: browser,
            page: page,
          });
        } else {
          throw new Error("Login Error Occured (probably requires phone code)");
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
        await humanTyping(
          "#secret-question-response",
          workerData.gmail.security,
          page
        );
        await page.waitForNavigation();
        if (page.url().includes("https://myaccount.google.com/")) {
          writeCookies(page);
          runFlow({
            browser: browser,
            page: page,
          });
        } else {
          throw new Error("Login Error Occured (probably requires phone code)");
        }
      } else {
        browser.close();
        parentPort.postMessage({
          id: workerData.gmail.uuid,
          group: workerData.gmail.groupID,
          errors: null,
          message: "Manual Login Required!",
        });
      }
    }
  }
};
let listenerb = false;
const listener = (browser1) => {
  listenerb = true;
  parentPort.on("message", async (message) => {
    if (message.uuid === workerData.gmail.uuid && message.op === 1) {
      browser1.close();
      const browserHeaded = await puppeteer.launch({
        headless: false,
        executablePath:
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      });
      const pageH = await browserHeaded.newPage();
      await pageH.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36"
      );
      await pageH.goto("https://accounts.google.com/");
      await loggedIn(pageH);
      await pageH.goto("chrome://version");
      let temp = await pageH.evaluate(
        () => document.getElementById("profile_path").innerHTML
      );
      let userDataDir = temp.split("\\Default")[0];
      var browser = await puppeteer.launch({
        headless: false,
        executablePath:
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        args: [`--user-data-dir=${userDataDir}`],
      });
      var page = await browser.newPage();
      browserHeaded.close();
      writeCookies(page);
      runFlow({
        browser: browser,
        page: page,
      });
    } else if (workerData.gmail.uuid === message.uuid && message.op === 2) {
      browser1.close();
      parentPort.postMessage({
        id: workerData.gmail.uuid,
        group: workerData.gmail.groupID,
        message: "stop",
      });
    }
  });
};

if (isMainThread) {
} else {
  (async () => {
    try {
      //STOP TASKS N SHITTTT

      if (workerData.manual) {
        var browserHeaded = await puppeteer.launch({
          headless: false,
          executablePath:
            "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        });
        var pageH = await browserHeaded.newPage();
        await pageH.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36"
        );
        await pageH.goto("https://accounts.google.com/");
        await loggedIn(pageH);
        let cookies = await writeCookies(pageH);
        browserHeaded.close();
        //mark

        if (workerData.gmail.proxy !== "localhost") {
          let proxy = workerData.gmail.proxy;
          var browser = await puppeteer.launch({
            headless: true,
            executablePath:
              "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
            args: [
              `--user-data-dir=${userDataDir}`,
              `--proxy-server=${proxy.split(":")[0]}:${proxy.split(":")[1]}`,
            ],
          });
          listener(browser);
          var page = await browser.newPage();
          await restoreCookies(page, cookies);
          await page.goto("https://accounts.google.com/");
          runFlow({
            browser: browser,
            page: page,
          });
        } else {
          var browser = await puppeteer.launch({
            headless: true,
            executablePath:
              "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
          });
          listener(browser);
          var page = await browser.newPage();
          await restoreCookies(page, cookies);
          await page.goto("https://accounts.google.com/");
          runFlow({
            browser: browser,
            page: page,
          });
        }
      } else {
        if (workerData.gmail.proxy !== "localhost") {
          let proxy = workerData.gmail.proxy;
          var browser = await puppeteer.launch({
            headless: true,
            executablePath:
              "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
            args: [
              "--proxy-server=" +
                proxy.split(":")[0] +
                ":" +
                proxy.split(":")[1],
            ],
          });
          listener(browser);
          login(browser, proxy);
        } else {
          var browser = await puppeteer.launch({
            headless: true,
            executablePath:
              "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
          });
          listener(browser);
          login(browser);
        }
      }

      parentPort.postMessage({
        id: workerData.gmail.uuid,
        group: workerData.gmail.groupID,
        errors: null,
        message: "Starting Task",
      });
    } catch (err) {
      console.log("Manual Login Required", err);
      if (browser) {
        browser.close();
      }
      parentPort.postMessage({
        id: workerData.gmail.uuid,
        group: workerData.gmail.groupID,
        errors: null,
        message: "Manual Login Required!",
      });
    }
  })();
}
