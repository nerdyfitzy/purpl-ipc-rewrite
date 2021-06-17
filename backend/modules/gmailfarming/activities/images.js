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
  "map of america",
  "map of europe",
  "map of asia",
  "map of middle east",
  "ancient rome map",
  "rhone river",
  "mississippi river",
  "hummingbird",
  "blue jay",
  "racoon",
  "north american birds",
  "canadian map",
  "map of states and capitols",
  "my hero acadamia",
  "attack on titan",
  "mario",
  "playboi carti",
  "whole lotta red",
  "mark zuckerberg",
];

const images = async (page) => {
  try {
    const term = terms[Math.floor(Math.random() * terms.length)];
    await page.goto("https://www.google.com/imghp?hl=EN");
    await page.waitFor(500);
    await humanTyping("input.gLFyf.gsfi", term, page);
    await page.waitFor(100);
    await page.keyboard.press("Enter");
    await page.waitForNavigation();
    let dim = await page.evaluate(() => {
      let elements = document.getElementsByClassName(
        "isv-r PNCib MSM1fd BUooTd"
      );
      let random = Math.floor(Math.random() * elements.length);
      let rect = elements[random].getBoundingClientRect();
      console.log(elements[random], "info");
      return {
        element: elements[random],
        top: rect.top,
        right: rect.right,
        bot: rect.bottom,
        left: rect.left,
      };
    });
    console.log(dim, "debug");
    let temp = dim.bot;
    await autoScroll(
      page,
      temp,
      Math.floor(Math.random() * 5 + 5) * 1000 + Date.now()
    );
  } catch (err) {
    console.log(err, "error");
  }
};

const autoScroll = async (page, height, time) => {
  try {
    await page.evaluate(height.toString(), async (height) => {
      //height = parseInt(height)
      console.log(height, "debug");
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = 4000;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        } else if (Date.now() === time) {
          clearInterval(timer);
          resolve();
        }
      }, 500);
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

const scrollTo = async (x, y, page) => {
  return page.evaluate(
    (_x, _y) => {
      window.scrollTo(parseInt(_x || 0, 10), parseInt(_y || 0, 10));
    },
    x,
    y
  );
};

module.exports = {
  images: images,
};
