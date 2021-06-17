const { cancelAsk } = require("./cancelAsk");
const { editAsk } = require("./editAsk");
const { getStockxPricesAsTable, getStockxGraphs } = require("./getPrices");
const { login } = require("./login");
const { placeAsk } = require("./placeask");
const { search } = require("./searchProducts");
const { getVar } = require("./getVar");
const getAllSales = require("./getAllSales");

module.exports = {
  cancelAsk: cancelAsk,
  editAsk: editAsk,
  getStockxGraphs: getStockxGraphs,
  getStockxPricesAsTable: getStockxPricesAsTable,
  login: login,
  placeAsk: placeAsk,
  search: search,
  getVar: getVar,
  getAllSales: getAllSales,
};
