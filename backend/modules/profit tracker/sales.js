const { v4 } = require("uuid");
const fs = require("fs");
const { deleteInventoryItem, getInventoryItem } = require("./inventory");
const { login, getAllSales, search } = require("./stockx/stockx");
const path = require("path");
const console = require("../../utils/logger");
let sales = {};
let salesGraph = [];

const loadSales = async (fromfile) => {
  if (fromfile) {
    if (
      !fs.existsSync(
        path.join(process.env.APPDATA, "purpl", "local-data", "sales.json")
      )
    )
      return "undefined";
    const data = fs.readFileSync(
      path.join(process.env.APPDATA, "purpl", "local-data", "sales.json")
    );
    sales = JSON.parse(data);
    return JSON.parse(data);
  } else {
    return sales;
  }
};

const convertDateToUnix = (raw) => {
  if (raw.contains("-")) {
    const STOCKX = raw.replace("-", ".");
    const dateNew = new Date(STOCKX.split("T")[0]);
    return dateNew.getTime() / 1000;
  } else {
    const PURPL_SPLIT = raw.split("/");
    const dateNew = new Date(
      `${PURPL_SPLIT[2]}.${PURPL_SPLIT[0]}.${PURPL_SPLIT[1]}`
    );
    return dateNew.getTime() / 1000;
  }
};

const saveSales = () => {
  console.log(`[${new Date().toLocaleTimeString()}] - Saving sales`);
  fs.writeFileSync(
    path.join(process.env.APPDATA, "purpl", "local-data", "sales.json"),
    JSON.stringify(sales)
  );
};

const saveGraph = () => {
  console.log(`[${new Date().toLocaleTimeString()}] - Saving sales graph`);
  fs.writeFileSync(
    path.join(process.env.APPDATA, "purpl", "local-data", "salesGraph.json"),
    JSON.stringify(salesGraph)
  );
};

const getSalesGraph = async () => {
  if (
    !fs.existsSync(
      path.join(process.env.APPDATA, "purpl", "local-data", "salesGraph.json")
    )
  )
    return [{ label: null, data: null }];
  const data = fs.readFileSync(
    path.join(process.env.APPDATA, "purpl", "local-data", "salesGraph.json")
  );
  salesGraph = JSON.parse(data);
  return JSON.parse(data);
};

const markAsSold = async (uuid, amt, shipping, platform, date) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Marking ${uuid} as sold`);
  const u = v4();
  const unsold = getInventoryItem(uuid);
  const unparsedStockx = fs.readFileSync(
    path.join(process.env.APPDATA, "purpl", "local-data", "session.json")
  );
  const fee = JSON.parse(unparsedStockx).selling.fee;
  sales[u] = {
    uuid: u,
    name: unsold.name,
    img: unsold.img,
    color: unsold.color,
    size: unsold.size,
    platform: platform,
    status: "Sold",
    prices: {
      price: inventory[uuid].generalInfo.price,
      profit: amt - inventory[uuid].generalInfo.price - fee - shipping,
      listingAmount: amt,
    },
    date: convertDateToUnix(date),
    dateReadable: date,
  };
  salesGraph.push({
    label: date,
    data: Object.values(sales).reduce((total, item) => {
      return (total += item.prices.profit);
    }, 0),
  });
  deleteInventoryItem(uuid);
  saveSales();
  return sales[u];
};

const getTotalSales = (start = 0, end = Date.now()) => {
  return Object.values(sales).reduce((count, item) => {
    if (item.date > start && item.date < end) {
      return count++;
    }
  }, 0);
};

const getSoldSpend = (start = 0, end = Date.now()) => {
  return Object.values(sales).reduce((total, item) => {
    if (item.date > start && item.date < end) {
      return (total += item.price);
    }
  }, 0);
};

const getGross = (start = 0, end = Date.now()) => {
  return Object.values(sales).reduce((total, item) => {
    if (item.date >= start && item.date <= end) {
      return (total += item.profit + item.price);
    }
  }, 0);
};

const getRealProfit = (start = 0, end = Date.now()) => {
  return Object.values(sales).reduce((total, item) => {
    if (item.date >= start && item.date <= end) {
      return (total += item.prices.profit);
    }
  }, 0);
};

const importSales = async () => {
  if (
    !fs.existsSync(
      path.join(process.env.APPDATA, "purpl", "local-data", "session.json")
    )
  ) {
    await login();
  }
  const all = await getAllSales();
  all.forEach(async (imported) => {
    const shoe = await search(imported.sku);
    const u = v4();
    sales[u] = {
      uuid: u,
      name: shoe[0].name,
      img: shoe[0].img,
      color: shoe[0].color,
      size: imported.size,
      platform: "StockX",
      status: "Sold",
      prices: {
        price: shoe[0].price,
        profit: imported.price - shoe[0].price - fee,
        listingAmount: imported.price,
      },
      date: convertDateToUnix(imported.date),
      dateReadable: date.split("T")[0],
    };
    salesGraph.push({
      label: imported.date,
      data: Object.values(sales).reduce((total, item) => {
        return (total += item.prices.profit);
      }, 0),
    });
  });

  return sales;
};

module.exports = {
  getTotalSales,
  getSoldSpend,
  getGross,
  getRealProfit,
  getSalesGraph,
  loadSales,
  markAsSold,
};
