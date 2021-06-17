const { getSalesGraph } = require("./sales");
const { getPortfolioGraph, getUnrealizedProfitGraph } = require("./inventory");

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

const getFilteredGraphs = async (start = 0, end = Date.now()) => {
  const unfilteredSales = await getSalesGraph();
  const unfilteredPortfolio = await getPortfolioGraph();
  const unfilteredUnreal = await getUnrealizedProfitGraph();

  const filteredSalesLabels = new Array();
  const filteredSalesData = new Array();

  const filteredPortfolioLabels = new Array();
  const filteredPortfolioData = new Array();

  const filteredUnrealLabels = new Array();
  const filteredUnrealData = new Array();

  const filteredSales = unfilteredSales.filter((sale) => {
    if (
      sale.label &&
      convertDateToUnix(sale.label) >= start &&
      convertDateToUnix(sale.label) <= end
    ) {
      filteredSalesLabels.push(sale.label);
      filteredSalesData.push(sale.data);
      return true;
    } else {
      return false;
    }
  });
  const filteredPortfolio = unfilteredPortfolio.filter((point) => {
    if (
      point.label &&
      convertDateToUnix(point.label) >= start &&
      convertDateToUnix(point.label) <= end
    ) {
      filteredPortfolioLabels.push(point.label);
      filteredPortfolioData.push(point.data);
      return true;
    } else {
      return false;
    }
  });

  const unrealizedProfit = unfilteredUnreal.filter((item) => {
    if (
      item.label &&
      convertDateToUnix(item.label) >= start &&
      convertDateToUnix(item.label) <= end
    ) {
      filteredUnrealLabels.push(item.label);
      filteredUnrealData.push(item.data);
      return true;
    } else {
      return false;
    }
  });

  return {
    filteredSales: {
      labels: filteredSalesLabels,
      data: filteredSalesData,
    },
    filteredPortfolio: {
      labels: filteredPortfolioLabels,
      data: filteredPortfolioData,
    },
    unrealizedProfit: {
      labels: filteredUnrealLabels,
      data: filteredUnrealData,
    },
  };
};

module.exports = {
  getFilteredGraphs,
};
