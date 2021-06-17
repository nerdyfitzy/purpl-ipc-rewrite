const got = require("got");
const fs = require("fs");
const { getVar } = require("./getVar");
const parseCookies = require("./parseCookies");
const path = require("path");
const console = require("../../../utils/logger");

//2021-04-15T03:42:27+0000 for expires
const placeAsk = async (id, link, size, expiresIn, price) => {
  if (
    !fs.existsSync(
      path.join(process.env.APPDATA, "purpl", "local-data", "session.json")
    )
  ) {
    throw new Error("Please Login to Stockx!");
  } else {
    try {
      const { jar, token } = await parseCookies();

      const variant = await getVar(link, size);

      const res = await got.post("https://stockx.com/api/portfolio", {
        searchParams: {
          a: "ask",
        },
        responseType: "json",
        headers: {
          authority: "stockx.com",
          appversion: "0.1",
          appos: "web",
          "x-requested-with": "XMLHttpRequest",
          "x-session-id": "50407788-d2dd-45c2-bc5d-9319fcd163da",
          authorization: `Bearer ${token}`,
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Safari/537.36",
          "content-type": "application/json",
          accept: "*/*",
          "sec-gpc": "1",
          origin: "https://stockx.com",
          "sec-fetch-site": "same-origin",
          "sec-fetch-mode": "cors",
          "sec-fetch-dest": "empty",
          referer: `https://stockx.com/sell/${link}?size=${size}`,
          "accept-language": "en-US,en;q=0.9",
        },
        jar,
        json: {
          action: "ask",
          PortfolioItem: {
            localAmount: price,
            expiresAt: expiresIn,
            skuUuid: variant,
            localCurrency: "USD",
            meta: {
              discountCode: "",
            },
          },
        },
      });

      if (res.statusCode === 200) {
        console.log("Ask placed");

        //save this, needed in order to edit the ask (whole obj)
        return res.body;
      } else {
      }
    } catch (e) {
      console.log(e.response, "error");
    }
  }
};

module.exports = {
  placeAsk: placeAsk,
};
