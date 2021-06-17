const got = require("got");
const fs = require("fs");
const parseCookies = require("./parseCookies");
const console = require("../../../utils/logger");

const cancelAsk = async (chainId) => {
  try {
    const { jar, token } = await parseCookies();
    const res = await got.delete(
      `https://stockx.com/api/portfolio/${chainId}`,
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
        json: {
          chain_id: chainId,
          notes: "Customer Removed Bid",
        },
        jar: jar,
      }
    );
    if (res.statusCode === 200) {
      console.log("Ask Deleted", "info");
      return true;
    } else {
      console.log(res.body, "info");
      return false;
    }
  } catch (e) {
    console.log(e.response, "error");
    return false;
  }
};

module.exports = {
  cancelAsk: cancelAsk,
};
