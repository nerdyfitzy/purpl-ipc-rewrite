const got = require("got");
const parseCookies = require("./parseCookies");
const console = require("../../../utils/logger");
module.exports = async () => {
  try {
    const { jar, token } = await parseCookies();
    const res = got.post("https://stockx.com/api/graphql", {
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
        referer: `https://stockx.com/selling`,
        "accept-language": "en-US,en;q=0.9",
      },
      jar,
      json: {
        operationName: "FetchCustomerAsks",
        variables: {
          limit: 1000,
          state: "HISTORICAL",
          sort: "LISTED_AT",
          order: "DESC",
          query: "",
          currency: null,
          country: "US",
        },
        query:
          "query FetchCustomerAsks($limit: Int, $state: AsksGeneralState, $sort: AsksSortInput, $order: AscDescOrderInput, $after: String, $query: String, $currency: CurrencyCode, $country: String!) {\n  viewer {\n    asks(\n      state: $state\n      first: $limit\n      sort: $sort\n      order: $order\n      after: $after\n      query: $query\n      currencyCode: $currency\n    ) {\n      pageInfo {\n        hasNextPage\n        endCursor\n        __typename\n      }\n      edges {\n        node {\n          id\n          state\n          authCenter\n          expires\n          amount\n          orderNumber\n          originalCurrency\n          soldOn\n          amount\n          bidAskSpread\n          shipment {\n            shipByDate\n            bulk\n            __typename\n          }\n          productVariant {\n            id\n            traits {\n              size\n              sizeDescriptor\n              __typename\n            }\n            market(currencyCode: $currency) {\n              bidAskData(country: $country) {\n                lowestAsk\n                highestBid\n                __typename\n              }\n              __typename\n            }\n            product {\n              id\n              uuid\n              contentGroup\n              productCategory\n              urlKey\n              model\n              name\n              restock\n              styleId\n              minimumBid\n              media {\n                thumbUrl\n                __typename\n              }\n              __typename\n            }\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n",
      },
      responseType: "json",
    });
    const sales = new Array();
    res.body.data.viewer.asks.pageInfo.edges.forEach((sale) => {
      //   console.log(
      //     `${sale.node.productVariant.product.styleId} sold on ${sale.node.soldOn} for ${sale.node.amount}\n`
      //   );

      sales.push({
        sku: sale.node.productVariant.product.styleId,
        date: sale.node.soldOn,
        price: sale.node.amount,
        size: sale.node.productVariant.traits.size,
      });
    });

    return sales;
  } catch (e) {
    console.log(e.response, "error");
  }
};
