const fs = require("fs");
const { v4 } = require("uuid");
const path = require("path");
const console = require("../../utils/logger");
const { ipcMain } = require("electron");
const clipboardy = require("clipboardy");
//proxy example
let proxyExample = {
  uuid: "this is a specific uuid for each proxy",
  proxy: "this is the actual proxy",
  speed: "either undefined or the speed of last test",
};

var groups = {
  default: {
    uuid: "default",
    name: "Default List",
    proxies: {},
  },
};

var loaded = false;

const loadProxies = async (fromfile, group) => {
  if (fromfile) {
    if (
      fs.existsSync(
        path.join(process.env.APPDATA, "purpl", "local-data", "proxies.json")
      )
    ) {
      let temp = fs.readFileSync(
        path.join(process.env.APPDATA, "purpl", "local-data", "proxies.json"),
        "utf8"
      );
      groups = JSON.parse(temp);
      return JSON.parse(temp);
    } else {
      saveProxies();
      return groups;
    }
  } else {
    if (
      !loaded &&
      fs.existsSync(
        path.join(process.env.APPDATA, "purpl", "local-data", "proxies.json")
      )
    ) {
      let temp = fs.readFileSync(
        path.join(process.env.APPDATA, "purpl", "local-data", "proxies.json"),
        "utf8"
      );
      groups = JSON.parse(temp);
      loaded = true;
    }
    console.log(
      `[${new Date().toLocaleTimeString()}] - Loading Group ` + group
    );
    if (typeof group === "undefined") return groups;
    return groups[group].proxies;
  }
};

var SpeedArr = [];
const setSpeed = (proxy, group, speed) => {
  groups[group].proxies[proxy].speed = speed;
  SpeedArr.push({ proxy, speed });
  saveProxies();
};

ipcMain.on("request-speeds", (event) => {
  event.reply("got-speeds", SpeedArr);
  SpeedArr = [];
});

//proxies are an array of objects, give each a specific uuid and add to the group in question
const addProxies = (proxies, group) => {
  var newProxies = {};
  proxies.forEach((proxy) => {
    let uuid = v4();
    groups[group].proxies[uuid] = {
      uuid: uuid,
      proxy: proxy,
      speed: "Untested",
    };
    newProxies[uuid] = {
      uuid: uuid,
      proxy: proxy,
      speed: "Untested",
    };
  });
  saveProxies();
  return newProxies;
};

const deleteProxy = (uuid, group) => {
  delete groups[group].proxies[uuid];
  saveProxies();
};

const addGroup = (name) => {
  let uuid = v4();
  groups[uuid] = {
    uuid: uuid,
    name: name,
    proxies: {},
  };
  saveProxies();
  return groups[uuid];
};

const editGroup = (newName, uuid) => {
  groups[uuid].name = newName;
  saveProxies();
};

const deleteGroup = (uuid) => {
  delete groups[uuid];
  saveProxies();
};

const deleteAll = (group) => {
  groups[group].proxies = {};
  saveProxies();
};

const getAll = () => {
  return groups;
};

const saveProxies = async () => {
  fs.writeFileSync(
    path.join(process.env.APPDATA, "purpl", "local-data", "proxies.json"),
    JSON.stringify(groups)
  );
  console.log(`[${new Date().toLocaleTimeString()}] - Wrote proxies`, "info");
  return;
};

const copyProxies = (sel, group) => {
  let copy = "";
  for (const id of sel) {
    copy += groups[group].proxies[id].proxy + "\n";
  }

  clipboardy.writeSync(copy);
};

module.exports = {
  addGroup: addGroup,
  editGroup: editGroup,
  loadProxies: loadProxies,
  deleteProxy: deleteProxy,
  addProxies: addProxies,
  deleteAll: deleteAll,
  getAll: getAll,
  saveProxies: saveProxies,
  deleteGroup,
  setSpeed,
  copyProxies,
};
