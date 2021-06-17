const { v4 } = require("uuid");
const fs = require("fs");

let expenses = {};

const console = require("../../utils/logger");

const convertDateToUnix = (raw) => {
  const split = raw.split("/");
  const dateNew = new Date(`${split[2]}.${split[0]}.${split[1]}`);
  return dateNew.getTime() / 1000;
};

const loadExpenses = async (fromfile) => {
  if (fromfile) {
    if (!fs.existsSync("expenses.json")) return "undefined";
    const dataEx = fs.readFileSync("expenses.json") || expenses;

    expenses = JSON.parse(dataEx);

    return expenses;
  } else {
    return expenses;
  }
};

const saveExpenses = () => {
  console.log(`[${new Date().toLocaleTimeString()}] - Saving Expenses`, "info");
  fs.writeFileSync("expenses.json", JSON.stringify(expenses));
};

const addExpense = async (name, price, tax, shipping, date, qty, type) => {
  const uuid = v4();
  expenses[uuid] = {
    uuid,
    name,
    price,
    tax,
    shipping,
    date: convertDateToUnix(date),
    qty,
    type,
  };

  saveExpenses();

  return expenses[uuid];
};

const getExpenses = () => {
  return Object.values(expenses).reduce((total, item) => {
    return (total += item.price * item.qty);
  }, 0);
};

module.exports = {
  loadExpenses: loadExpenses,
  addExpense: addExpense,
};
