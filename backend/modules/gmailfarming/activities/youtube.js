//Travels to youtube homepage
const terms = [
  "pewdiepie",
  "asmr",
  "music",
  "markiplier",
  "old town road",
  "billie eilish",
  "fortnite",
  "david dobrik",
  "jacksepticeye",
  "james charles",
  "joe rogan",
  "baby shark",
  "bts",
  "dantdm",
  "cnn",
  "wwe",
  "lofi hiphop beats",
  "badabun",
  "blackpink",
  "tiktok",
  "tiktok renegade",
  "tiktok buss it",
  "tiktok big bank",
];
const console = require("../../../utils/logger");

async function travelToYoutube(page) {
  try {
    async () => {
      await page.goto("https://google.com");
      page.waitfor(3000);
      await page.type("input.gLFyf.gsfi", "youtube");
      page.waitFor(2000);
      page.keyboard.press("Enter");
      await page.waitForSelector("div#resultStats");
      const links = await page.$$("div.r");
      page.waitFor(1230);
      await links[0].click();
    };
  } catch (err) {
    console.log(err, "error");
  }
}

// searches for random YT video TODO:
async function watchYT(page) {
  try {
    const term = terms[Math.floor(Math.random() * terms.length)];
    console.log(term, "debug");
    await page.goto("https://www.youtube.com/");
    await page.waitFor(500);
    await page.waitForSelector("#search");
    await humanTyping('[name="search_query"]', term, page);
    await page.waitFor(100);
    await page.keyboard.press("Enter");
    await page.waitFor(1000);

    page.on("console", (msg) => {
      for (let i = 0; i < msg.args().length; ++i)
        console.log(`${i}: ${msg.args()[i]}`, "info");
    });
    let videos = Math.floor(Math.random() * 5 + 5);
    console.log(videos, "debug");
    for (let i = 0; i < 1; i++) {
      console.log("video" + i, "debug");
      let link = await page.evaluate(async () => {
        try {
          let elements = document.getElementsByClassName(
            "yt-simple-endpoint style-scope ytd-video-renderer"
          );
          let random = Math.floor(Math.random() * elements.length);
          return elements[random].href;
        } catch (err) {
          console.log("error encountered! skipping video..." + err, "error");
        }
      });
      console.log(link, "info");
      await page.goto(link);
      try {
        if (
          page.$(
            "#player-overlay\\:1 > div.ytp-ad-player-overlay-instream-info"
          ) !== undefined
        ) {
          console.log("ad detected", "debug");
          if (page.$("#preskip-component\\:3 > span") !== undefined) {
            console.log("waiting 5s to skip", "debug");
            await page.waitFor(7500);
            await page.click('[class="ytp-ad-skip-button ytp-button"]');
            if (
              page.$(
                "#player-overlay\\:1 > div.ytp-ad-player-overlay-instream-info"
              ) !== undefined
            ) {
              console.log("ad detected", "debug");
              if (page.$("#preskip-component\\:3 > span") !== undefined) {
                console.log("waiting 5s to skip", "debug");
                await page.waitFor(7500);
                await page.click('[class="ytp-ad-skip-button ytp-button"]');
              }
            }
          }
        }
      } catch (err) {
        console.log(err, "error");
      }

      let info = await page.$eval('[class="ytp-time-duration"]', (element) => {
        let buttons = document.getElementById("button");
        let playpause = document.getElementsByClassName(
          "ytp-play-button ytp-button"
        );
        console.log(playpause, "info");
        if (playpause[0].outerHTML.includes("Play (k)")) {
          return {
            time: element.innerHTML,
            playing: false,
          };
        } else {
          return {
            time: element.innerHTML,
            playing: true,
          };
        }
      });
      console.log(info, "debug");
      if (info.playing === false) {
        page.click('[class="ytp-play-button ytp-button"]');
      } else {
        console.log("video is playing", "debug");
      }

      if (
        (info.time.split(":").length == 2 &&
          parseInt(info.time.split(":")[0]) <= 10) ||
        info.time.split(":").length == 1
      ) {
        console.log("under 10 minutes, watching all", "info");
        await page.click('[aria-label="Subscribe"]');
        await checktime(page, info.time);
      } else {
        console.log("above 10 minutes, i hate this shit", "debug");
        await page.click('[class="style-scope yt-icon-button"]');
        await page.waitFor(646231);
        //TODO: IMPLEMENT LIKE/DISLIKE
        let like = Math.floor(Math.random() * 9 + 1);
        if (like < 5) {
          //await page.click('[class="style-scope yt-icon-button"]');
        } else {
          await page.click('[aria-label="Subscribe"]');
          //await page.click('[class="style-scope yt-icon-button"]');
        }
      }
    }
  } catch (e) {
    console.log(e, "error");
  }
}

//like style-scope ytd-toggle-button-renderer style-text
//dislike style-scope ytd-toggle-button-renderer style-text

const humanTyping = async (element, word, page) => {
  for (let i = 0; i < word.length; i++) {
    await page.type(element, word.charAt(i));
    await page.waitFor(100);
  }
};

const autoScroll = async (page) => {
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
};

const checktime = async (page, time) => {
  try {
    page.$eval('[class="ytp-time-current"]', (element) => {
      if (element.innerHTML === time) {
        console.log("video over", "debug");
        return true;
      } else {
        setTimeout(checktime(page, time), 30000);
      }
    });
  } catch (e) {
    console.log(e, "error");
  }
};

module.exports = {
  watchYT: watchYT,
};
