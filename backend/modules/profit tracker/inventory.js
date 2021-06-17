const { v4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const {
  placeAsk,
  cancelAsk,
  search,
  getStockxPricesAsTable,
} = require("./stockx/stockx");

const console = require("../../utils/logger");

let inventory = {};
let portfolioGraph = [];
let unrealizedProfitGraph = {};

//mm/dd/yyyy => unix
const convertDateToUnix = (raw) => {
  const split = raw.split("/");
  const dateNew = new Date(`${split[2]}.${split[0]}.${split[1]}`);
  return dateNew.getTime() / 1000;
};

const loadInventory = async (fromfile) => {
  if (fromfile) {
    if (
      !fs.existsSync(
        path.join(process.env.APPDATA, "purpl", "local-data", "inventory.json")
      )
    )
      return "undefined";
    const dataInventory =
      fs.readFileSync(
        path.join(process.env.APPDATA, "purpl", "local-data", "inventory.json")
      ) || inventory;

    inventory = JSON.parse(dataInventory);

    console.log(inventory, "info");

    return inventory;
  } else {
    return inventory;
  }
};

const saveInventory = () => {
  console.log(
    `[${new Date().toLocaleTimeString()}] - Saving inventory`,
    "info"
  );
  fs.writeFileSync(
    path.join(process.env.APPDATA, "purpl", "local-data", "inventory.json"),
    JSON.stringify(inventory)
  );
};

const saveUnrealProfitGraph = () => {
  console.log(
    `[${new Date().toLocaleTimeString()}] - Saving unrealized profit`,
    "info"
  );
  fs.writeFileSync(
    path.join(
      process.env.APPDATA,
      "purpl",
      "local-data",
      "unrealizedProfit.json"
    ),
    JSON.stringify(unrealizedProfitGraph)
  );
};

const updateMarketOnItem = async (uuid) => {
  console.log(
    `[${new Date().toLocaleTimeString()}] - Getting StockX price for item`
  );
  const prices = await getStockxPricesAsTable(
    inventory[uuid].stockxInfo.url,
    inventory[uuid].size
  );
  console.log(
    `[${new Date().toLocaleTimeString()}] - Got prices` + prices,
    "info"
  );
  inventory[uuid].market.value = Math.round(
    (prices.highestBid + prices.lastSale + prices.lowestAsk) / 3
  );

  inventory[uuid].market.unrealized = Math.round(
    inventory[uuid].market.value - inventory[uuid].generalInfo.price
  );
  console.log(
    "rounded " +
      Math.round(inventory[uuid].market.unrealized) +
      " " +
      Math.round(inventory[uuid].market.value),
    "debug"
  );

  unrealizedProfitGraph[uuid] = {
    uuid: uuid,
    label: inventory[uuid].generalInfo.dateReadable,
    data: Object.values(inventory).reduce(
      (total, item) => (total += item.market.unrealized)
    ),
  };
  saveInventory();
  return;
};

const savePortfolioGraph = () => {
  console.log(
    `[${new Date().toLocaleTimeString()}] - Saving portfolio`,
    "info"
  );
  fs.writeFileSync(
    path.join(process.env.APPDATA, "purpl", "local-data", "portfolio.json"),
    JSON.stringify(portfolioGraph)
  );
};

const addItem = async (name, itemSize, price, store, date, order, tags) => {
  const u = v4();
  const shoe = await search(name);
  tags.push(shoe[0].name);
  inventory[u] = {
    uuid: u,
    name: shoe ? shoe[0].name : name,
    img: shoe
      ? shoe[0].img
      : "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Question_mark_%28black%29.svg/200px-Question_mark_%28black%29.svg.png",
    size: itemSize,
    color: shoe[0].color,
    status: "Unlisted",
    tags: tags,
    market: {
      value: null,
      unrealized: null,
    },
    stockxInfo: {
      url: shoe ? shoe[0].url : undefined,
      id: shoe ? shoe[0].stockXsku : undefined,
      chainId: null,
      askData: null,
      askPrice: null,
    },
    generalInfo: {
      sku: shoe ? shoe[0].sku : undefined,
      price: price,
      store: store,
      date: convertDateToUnix(date),
      dateReadable: date,
      order: order,
    },
  };
  console.log(inventory[u], "debug");
  if (shoe) {
    await updateMarketOnItem(u);
  }
  portfolioGraph.push({
    label: date,
    data: Object.values(inventory).reduce((total, item) => {
      return item.market.value ? (total += item.market.value) : total;
    }, 0),
  });
  savePortfolioGraph();
  saveInventory();
  return inventory[u];
};

const placeAskForShoe = async (uuid, askPrice) => {
  if (inventory[uuid].stockxInfo) return;
  const data = await placeAsk(
    inventory[uuid].stockxInfo.id,
    inventory[uuid].stockxInfo.url,
    inventory[uuid].size,
    30,
    askPrice
  );
  inventory[uuid].stockxInfo.askData = data;
  inventory[uuid].stockxInfo.chainId = data.PortfolioItem.chainId;
  inventory[uuid].status = "Listed";
  inventory[uuid].askPrice = askPrice;

  return true;
};

const cancelAskForShoe = async (uuid) => {
  if (inventory[uuid].stockxInfo.chainId === undefined) return false;
  if (await cancelAsk(inventory[uuid].stockxInfo.chainId)) {
    return true;
  } else {
    return false;
  }
};

const getPortfolioGraph = async () => {
  if (
    !fs.existsSync(
      path.join(process.env.APPDATA, "purpl", "local-data", "portfolio.json")
    )
  )
    return [{ label: null, data: null }];
  const data = fs.readFileSync(
    path.join(process.env.APPDATA, "purpl", "local-data", "portfolio.json")
  );
  portfolioGraph = JSON.parse(data);
  return JSON.parse(data);
};

const getUnrealizedProfitGraph = async () => {
  if (
    !fs.existsSync(
      path.join(
        process.env.APPDATA,
        "purpl",
        "local-data",
        "unrealizedProfit.json"
      )
    )
  )
    return [{ label: null, data: null }];
  const data = fs.readFileSync(
    path.join(
      process.env.APPDATA,
      "purpl",
      "local-data",
      "unrealizedProfit.json"
    )
  );
  unrealizedProfitGraph = JSON.parse(data);
  return JSON.parse(data);
};

const refreshPrices = async () => {
  Object.values(inventory).forEach(async (item) => {
    if (item.stockxInfo.url) {
      updateMarketOnItem(item.uuid);
    }
  });

  return inventory;
};

const getInventoryItem = (u) => {
  return inventory[u];
};

const deleteInventoryItem = (u) => {
  delete inventory[u];
};

const getUnrealProfit = async (
  countUnrealized,
  start = 0,
  end = Date.now()
) => {
  if (!countUnrealized) return 0;
  return Object.values(inventory).reduce((total, item) => {
    if (item.date >= start && item.date <= end) {
      return (total += item.market.unrealized);
    }
  }, 0);
};

const getCurrentInventorySpend = (start = 0, end = Date.now()) => {
  const inventorySpent = Object.values(inventory).reduce((total, item) => {
    if (item.date >= start && item.date <= end) {
      return (total += item.generalInfo.price);
    }
  }, 0);

  return inventorySpent;
};

const getInventoryOrders = (start = 0, end = Date.now()) => {
  const total = Object.values(inventory).reduce((count, item) => {
    if (item.date > start && item.date < end) {
      return count++;
    }
  }, 0);
  return total;
};

module.exports = {
  getCurrentInventorySpend: getCurrentInventorySpend,
  getUnrealProfit: getUnrealProfit,
  getInventoryOrders: getInventoryOrders,
  loadInventory: loadInventory,
  addItem: addItem,
  refreshPrices: refreshPrices,
  getInventoryItem: getInventoryItem,
  deleteInventoryItem: deleteInventoryItem,
  getPortfolioGraph: getPortfolioGraph,
  getUnrealizedProfitGraph: getUnrealizedProfitGraph,
};
