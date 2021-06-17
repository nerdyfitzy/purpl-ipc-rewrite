const got = require("got");
const fs = require("fs");
const parseCookies = require("./parseCookies");
const path = require("path");
const console = require("../../../utils/logger");

const getStockxPricesAsTable = async (url, size = false) => {
  try {
    const { jar, token } = await parseCookies();
    const res = await got.get(
      `https://stockx.com/api/products/${url}?includes=market,360&currency=USD&country=US`,
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
        responseType: "json",
        jar,
      }
    );

    if (res.statusCode === 200) {
      let prices = {};
      if (!size) {
        Object.values(res.body.Product.children).forEach((variant) => {
          prices[`${variant.shoeSize}`] = {
            size: variant.shoeSize,
            lowestAsk: variant.market.lowestAsk,
            highestBid: variant.market.highestBid,
            lastSale: variant.market.lastSale,
          };
        });
      } else {
        const found = Object.values(res.body.Product.children).filter(
          (variant) => variant.shoeSize === size
        );
        return {
          size: size,
          lowestAsk: found[0].market.lowestAsk,
          highestBid: found[0].market.highestBid,
          lastSale: found[0].market.lastSale,
        };
      }
    } else {
      console.log("RES WAS NOT 200" + res);
    }
  } catch (e) {
    console.log("error", "error");
  }
};

const getStockxGraphs = async (id, startDate, endDate) => {
  try {
    const unparsed = fs.readFileSync(
      path.join(process.env.APPDATA, "purpl", "local-data", "session.json")
    );
    const token = JSON.parse(unparsed).value;
    const res = await got.get(
      `https://stockx.com/api/products/${id}/chart?start_date=${startDate}&end_date=${endDate}&intervals=100&format=highstock&currency=USD&country=US`,
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
        responseType: "json",
      }
    );

    if (res.statusCode === 200) {
      return res.body.series[0].data;
    } else {
      return false;
    }
  } catch (e) {
    console.error(e.response);
    return false;
  }
};

module.exports = {
  getStockxPricesAsTable: getStockxPricesAsTable,
  getStockxGraphs: getStockxGraphs,
};
