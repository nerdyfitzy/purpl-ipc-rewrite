const {
  getTotalSpent,
  getShoeProfit,
  getTotalSales,
  getTotalOrders,
} = require("./inventory");
const { getExpenses } = require("./expenses");
const expenses = require("./expenses");

const updateProfit = async (start = 0, end = Date.now(), countUnrealized) => {
  const profit = await getShoeProfit(countUnrealized, start, end);
  const expenses = await getExpenses();

  //TODO: ADD DATE FILTERING
};

const updateSpent = async (start = 0, end = Date.now()) => {
  const totalSpent = await getTotalSpent(start, end);
};

const updateSales = () => {
  const totalSales = getTotalSales(start, end);
};

const totalOrders = () => {
  const totalOrders = getTotalOrders(start, end);
};
