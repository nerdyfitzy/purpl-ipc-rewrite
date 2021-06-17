const got = require("got");
const fs = require("fs");
const parseCookies = require("./parseCookies");
const path = require("path");
const console = require("../../../utils/logger");

const getVar = async (url, findSize) => {
  if (
    !fs.existsSync(
      path.join(process.env.APPDATA, "purpl", "local-data", "session.json")
    )
  ) {
    throw new Error("Please Login to Stockx");
  } else {
    try {
      const { jar, token } = await parseCookies();
      const res = await got.get(`https://stockx.com/api/products/${url}`, {
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
          referer: `https://stockx.com/${url}`,
          "accept-language": "en-US,en;q=0.9",
        },
        searchParams: {
          includes: "market,360",
          currency: "USD",
          country: "US",
        },
        jar,
      });

      if (res.statusCode === 200) {
        console.log("Successfully got Variants", "info");
        const regexp = /[a-zA-Z]/g;

        Object.values(JSON.parse(res.body).Product.children).forEach((size) => {
          if (
            size.shoeSize === findSize ||
            (regexp.test(findSize) &&
              size.shoeSize.substring(0, size.shoeSize.length - 1) ===
                findSize.substring(0, findSize.length - 1))
          ) {
            return size.uuid;
          }
        });
      }
    } catch (e) {
      console.error(e.response.headers);
    }
  }
};

module.exports = {
  getVar: getVar,
};
