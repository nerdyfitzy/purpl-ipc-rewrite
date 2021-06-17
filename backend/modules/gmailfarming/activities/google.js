//Random google search, clicks on second result then scrolls down the page
const console = require("../../../utils/logger");
const terms = [
  "nfl",
  "football",
  "covid-19",
  "covid-19 vaccine",
  "covid-19 deaths",
  "denzel curry",
  "a tribe called quest",
  "node js tutorial",
  "html tutorial",
  "frontend development",
  "super smash bros.",
  "ps5",
  "xbox 1 x",
  "nintendo switch",
  "facebook",
  "youtube",
  "amazon",
  "gmail",
  "weather",
  "ebay",
  "Google",
  "yahoo",
  "walmart",
  "yahoo mail",
  "google translate",
  "google maps",
  "craigslist",
  "netflix",
  "hulu",
  "mla citation",
  "chicago format",
  "ala format",
  "home depot",
  "fox news",
  "cnn",
  "bbc",
  "hotmail",
  "google drive",
  "maps",
  "lowes",
  "apple",
  "iphone",
  "iphone 12",
  "instagram",
  "snapchat",
  "tiktok",
  "msn",
  "tiktok renegade",
  "tiktok buss it",
  "tiktok big bank",
  "espn",
  "zillow",
  "bank of america",
  "memes",
  "twitter",
  "google classroom",
  "bestbuy",
  "speedtest",
  "linkedin",
  "aol mail",
  "nba",
  "roblox",
  "capital one",
  "costco",
  "ups tracking",
  "fedex tracking",
  "jeeshmoji (pretty cool easter egg)",
  "reddit",
  "flights",
  "bing",
  "american airlines",
  "minimum wage",
  "current minimum wage",
  "why is raising the minimum wage good",
  "why is raising the minimum wage bad",
  "etsy",
  "dr martin luther king jr",
  "twitch",
  "dominos",
  "airbnb",
  "spotify",
  "nfl scores",
];

async function randomSearch(page) {
  try {
    const term = terms[Math.floor(Math.random() * terms.length)];
    await page.goto("https://google.com");
    await page.waitFor(500);
    await humanTyping("input.gLFyf.gsfi", term, page);
    await page.waitFor(100);
    await page.keyboard.press("Enter");
    await page.waitForNavigation();

    page.on("console", (msg) => {
      for (let i = 0; i < msg.args().length; ++i)
        console.log(`${i}: ${msg.args()[i]}`, "debug");
    });
    let searches = Math.floor(Math.random() * 5 + 5);
    console.log(searches, "info");
    for (let i = 0; i < searches; i++) {
      console.log("search" + i, "info");
      let link = await page.evaluate(() => {
        try {
          let elements = document.getElementsByClassName("g");
          let random = Math.floor(Math.random() * elements.length);
          if (elements[random].children[1] === undefined) {
            let link = elements[random].children[0].children[0].innerHTML
              .split(" ")[1]
              .split('"')[1];
            return link;
          } else {
            let link = elements[random].children[1].children[0].innerHTML
              .split(" ")[1]
              .split('"')[1];
            console.log(link);
            return link;
          }
        } catch (err) {
          console.log("error encountered! skipping search...", "error");
        }
      });
      try {
        console.log(link, "debug");
        const page2 = await browser.newPage();
        await page2.goto(link);
        await autoScroll(page2);
        console.log("scrolled");
        page2.close();
      } catch (err) {
        console.log("err occured! skipping article...", err);
        page2.close();
      }
    }
  } catch (e) {
    console.log(e, "error");
  }
}
//Scrolls down page on an interval
const autoScroll = async (page) => {
  try {
    await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
        var totalHeight = 0;
        var distance = 100;
        var timer = setInterval(() => {
          var scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 500);
      });
    });
  } catch (e) {
    console.log(e, "error");
  }
};

const humanTyping = async (element, word, page) => {
  for (let i = 0; i < word.length; i++) {
    await page.type(element, word.charAt(i));
    await page.waitFor(100);
  }
};

module.exports = {
  google: randomSearch,
};
