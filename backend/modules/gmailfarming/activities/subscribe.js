// const subscribeTo = (page, )
const console = require("../../../utils/logger");

const subto = async (page, email) => {
  try {
    let thingy = await page.evaluate(() => {
      let all = document.getElementsByClassName("subscribe-button");
      let sub = all[Math.floor(Math.random() * all.length)];
      console.log(sub.childNodes[0].getAttribute("aria-controls"), "info");
      return sub.childNodes[0].getAttribute("aria-controls");
    });
    await page.click(`[aria-controls="${thingy}"]`);
    await page.type(`#${thingy.substring(0, thingy.length - 5)}`, email, 500);
    await page.waitFor(1000);
    await page.evaluate((thingy) => {
      console.log(thingy, "info");
      const el = document.getElementById(thingy);
      el.childNodes[3].click();
    }, thingy);
    return;
  } catch (err) {
    console.log(err, "error");
    return;
  }
};

async function subscribe(page, email) {
  let newsletters = Math.floor(Math.random() * 5 + 5);

  await page.goto("https://subscriptions.cbc.ca/listmanagement");
  for (let i = 0; i < newsletters; i++) {
    await subto(page, email);
  }
}

module.exports = {
  subscribe: subscribe,
};
