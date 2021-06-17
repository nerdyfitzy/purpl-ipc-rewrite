const got = require("got");
const fs = require("fs");
const { getVar } = require("./getVar");
const path = require("path");
const parseCookies = require("./parseCookies");
const console = require("../../../utils/logger");

// {
//   "context": "selling",
//   "products": [
//     {
//       "sku": "4ec88cf4-79b8-4d54-a6c5-2a09fd43e998",
//       "amount": 130,
//       "quantity": 1
//     }
//   ],
//   "discountCodes": [
//     ""
//   ]
// }

const editAsk = async (url, price, size, askData) => {
  if (
    !fs.existsSync(
      path.join(process.env.APPDATA, "purpl", "local-data", "session.json")
    )
  ) {
    throw new Error("Please Login to Stockx");
  } else {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    const variant = await getVar(url, size);
    const { jar, token } = await parseCookies();
    const res = await got.post(
      "https://stockx.com/api/pricing?currency=USD&include_taxes=true",
      {
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
          "accept-language": "en-US,en;q=0.9",
        },
        jar,
        json: {
          action: "ask",
          PortfolioItem: {
            localAmount: price,
            expiresAt: date
              .toISOString()
              .replace(
                date.toISOString().charAt(date.toISOString().length - 1),
                "+0000"
              ),
            skuUuid: variant,
            localCurrency: "USD",
            meta: {
              discountCode: "",
            },
            chainId: askData.PortfolioItem.chainId,
          },
          item: askData,
        },
      }
    );

    if (res.statusCode === 200) {
      console.log("Successfully Edited");
      return true;
    } else {
      return false;
    }
  }
};

module.exports = {
  editAsk: editAsk,
};

// editAsk("air-jordan-12-retro-reverse-flu-game-gs", 135, "4Y");
