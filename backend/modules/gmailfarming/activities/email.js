const fs = require("fs");
const path = require("path");
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

const checkEmails = async (page) => {
  await page.goto("https://mail.google.com/mail/u/0/#inbox");
  await page.mouse.click(357, 183);
  console.log("clicking on first email", "info");
  for (let i = 0; i < Math.floor(Math.random() * 5 + 2); i++) {
    console.log("email number " + i, "info");
    await page.waitFor(Math.floor(Math.random() * 5000 + 5000));
    await page.mouse.click(888, 88);
  }

  await page.mouse.click(99, 86);
  await page.mouse.click(35, 97);

  console.log("done with all da emails", "info");
};

const sendEmails = async (page) => {
  const all = fs.readFileSync(
    path.join(process.env.APPDATA, "purpl", "local-data", "gmails.json")
  );
  let gmails = Object.values(JSON.parse(all))[
    Math.floor(Math.random() * Object.values(JSON.parse(all)).length)
  ].gmails;
  if (gmails.length > 0) {
    let email =
      Object.values(gmails)[
        Math.floor(Math.random() * Object.values(gmails).length)
      ];
    await humanTyping('[name="to"]', email.email, page);
    await humanTyping(
      '[name="subjectbox"]',
      terms[Math.floor(Math.random() * terms.length)],
      page
    );
    await humanTyping(
      '[class="Am Al editable LW-avf tS-tW"][aria-label="Message Body"][role="textbox"]',
      terms[Math.floor(Math.random() * terms.length)],
      page
    );
  }
};

const humanTyping = async (element, word, page) => {
  for (let i = 0; i < word.length; i++) {
    await page.type(element, word.charAt(i));
    await page.waitFor(100);
  }
};

module.exports = {
  checkEmails: checkEmails,
  sendEmails: sendEmails,
};
