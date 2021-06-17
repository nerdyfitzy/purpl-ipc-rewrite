const { ipcRenderer, remote } = require("electron");
const path = require("path");
const $ = require("jquery");
const Chart = require("chart.js");

const profitChartElement = $("#profit-chart");
const portfolioChartEl = $("#portfolio-chart");

const convertDateToUnix = (raw) => {
  const PURPL_SPLIT = raw.split("-");
  const dateNew = new Date(
    `${PURPL_SPLIT[2]}.${PURPL_SPLIT[0]}.${PURPL_SPLIT[1]}`
  );
  return dateNew.getTime() / 1000;
};

const setChart = async () => {
  const START_DATE = convertDateToUnix($("#start-date").val());
  const END_DATE = convertDateToUnix($("#end-date").val());
  const parsedGraphs = ipcRenderer.sendSync("get-filtered-graphs", {
    START_DATE,
    END_DATE,
  });
  console.log("DA GRAPHS", parsedGraphs);
  let profitChart = new Chart(profitChartElement, {
    type: "line",
    data: {
      labels: $("#count-unsold").is(":checked")
        ? parsedGraphs.unrealizedProfit.labels
        : parsedGraphs.filteredSales.labels,
      datasets: [
        {
          label: $("#count-unsold").is(":checked")
            ? "Unrealized Profit"
            : "Profit",
          data: $("#count-unsold").is(":checked")
            ? parsedGraphs.unrealizedProfit.data
            : parsedGraphs.filteredSales.data,
        },
      ],
    },
    options: {
      responsive: false,
      title: {
        display: false,
      },
    },
  });

  let portChart = new Chart(portfolioChartEl, {
    type: "line",
    data: {
      labels: parsedGraphs.filteredPortfolio.labels,
      datasets: [
        {
          label: "Portfolio Value",
          data: parsedGraphs.filteredPortfolio.data,
        },
      ],
    },
    options: {
      responsive: false,
      title: {
        display: false,
      },
    },
  });

  return;
};

const updateAnalytics = async () => {
  const START_DATE = convertDateToUnix($("#start-date").val());
  const END_DATE = convertDateToUnix($("#end-date").val());
  const parsed = ipcRenderer.sendSync("get-totals-profits", {
    start: START_DATE ? START_DATE : undefined,
    end: END_DATE ? END_DATE : undefined,
    countUnsold: $("#count-unsold").is(":checked") ? true : false,
  });
  $("#total-order").text(parsed.totalOrders);
  $("#tot-profit").text(`$${parsed.totalShoeProfit}`);
  $("#tot-spent").text(`$${parsed.totalSpent}`);
  $("#tot-gross").text(`$${parsed.gross}`);

  return;
};

$("#start-date").on("change", async function () {
  console.log(this.value);
  if (parseInt(this.value.split("-")[0]) > 1000) {
    await setChart();
    await updateAnalytics();
  }
});

$("#count-unsold").on("change", async () => {
  await updateAnalytics();
  await setChart();
});

$("#filter-analytics").on("click", async () => {
  await updateAnalytics();
  await setChart();
});

$("#last-week-filter").on("click", () => {
  const ONE_WEEK_MS = 604800000;
  const now = new Date(Date.now());
  const weekAgo = new Date(Date.now() - ONE_WEEK_MS);
  $("#end-date").val(`${now.getFullYear()}-${now.getMonth()}-${now.getDay()}`);
  $("#start-date").val(
    `${weekAgo.getFullYear()}-${weekAgo.getMonth()}-${weekAgo.getDay()}`
  );
});

$("#last-month-filter").on("click", () => {
  const ONE_MONTH_MS = 2629800000;
  const now = new Date(Date.now());
  const monthAgo = new Date(Date.now() - ONE_MONTH_MS);
  $("#end-date").val(`${now.getFullYear()}-${now.getMonth()}-${now.getDay()}`);
  $("#start-date").val(
    `${monthAgo.getFullYear()}-${monthAgo.getMonth()}-${monthAgo.getDay()}`
  );
  updateAnalytics();
  setChart();
});

$("#6-month-filter").on("click", () => {
  const SIX_MONTH_MS = 15778800000;
  const now = new Date(Date.now());
  const sixMonthAgo = new Date(Date.now() - SIX_MONTH_MS);
  $("#end-date").val(`${now.getFullYear()}-${now.getMonth()}-${now.getDay()}`);
  $("#start-date").val(
    `${sixMonthAgo.getFullYear()}-${sixMonthAgo.getMonth()}-${sixMonthAgo.getDay()}`
  );
  updateAnalytics();
  setChart();
});

$("#1-year-filter").on("click", () => {
  const ONE_YEAR_MS = 31557600000;
  const now = new Date(Date.now());
  const oneYearAgo = new Date(Date.now() - ONE_YEAR_MS);
  $("#end-date").val(`${now.getFullYear()}-${now.getMonth()}-${now.getDay()}`);
  $("#start-date").val(
    `${oneYearAgo.getFullYear()}-${oneYearAgo.getMonth()}-${oneYearAgo.getDay()}`
  );
  updateAnalytics();
  setChart();
});

const start = async () => {
  console.log("started");
  console.log(Date.now());
  await setChart();
  await updateAnalytics();
};

start();
