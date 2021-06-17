const got = require("got");
const fs = require("fs");
const { addItem } = require("../inventory");

const search = async (query) => {
  let res = await got.post(
    "https://xw7sbct9v6-dsn.algolia.net/1/indexes/products/query",
    {
      headers: {
        Connection: "keep-alive",
        "x-algolia-application-id": "XW7SBCT9V6",
        "x-algolia-api-key": "6b5e76b49705eb9f51a06d3c82f7acee",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Safari/537.36",
        "content-type": "application/json",
        Accept: "*/*",
        "Sec-GPC": "1",
        Origin: "https://stockx.com",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Accept-Language": "en-US,en;q=0.9",
      },
      json: {
        query: query,
        facets: "*",
        filters: "",
      },
      searchParams: {
        "x-algolia-agent":
          "Algolia^%^20for^%^20JavaScript^%^20(4.8.4)^%^3B^%^20Browser",
      },
      responseType: "json",
    }
  );

  if (res.body.hits.length === 0) return;
  let products = [];
  for (const hit of res.body.hits) {
    products.push({
      name: hit.name,
      img: hit.thumbnail_url,
      url: hit.url,
      sku: hit.style_id || hit.ticker_symbol,
      price: hit.price,
      stockXsku: hit.id,
      release: hit.release_date,
      color: hit.colorway,
      product_category: hit.product_category,
    });
  }
  return products;
};

module.exports = {
  search: search,
};
