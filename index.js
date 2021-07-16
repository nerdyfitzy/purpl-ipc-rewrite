const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  globalShortcut,
  ipcRenderer,
} = require("electron");
const path = require("path");

const console = require("./backend/utils/logger");

const gmailFarmer = require("./backend/modules/gmailfarming/index");
const proxy = require("./backend/modules/proxies/index");
const profiles = require("./backend/modules/profile maker/index");
const profits = require("./backend/modules/profit tracker/index");
const stockx = require("./backend/modules/profit tracker/stockx/stockx");
const engine = require("./backend/index");

const VCC_Controller = require("./backend/modules/profile maker/card gen/vcc_index");
const {
  Controller,
} = require("./backend/modules/profile maker/account gen/generate");

const test = require("./backend/modules/gmailfarming/utils/test");
const {
  saveSettings,
  getSettings,
} = require("./backend/utils/config/editConfig");
const Tester = require("./backend/modules/proxies/tester/test_main");

require("dotenv").config();

var gmailPage;
function createWindow(page) {
  // Create the browser window.
  if (page === "index.html") {
    var win = new BrowserWindow({
      width: 1400,
      height: 950,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
      },
      icon: "./assets/purplicon.ico",
      frame: false,
      resizable: false,
    });

    // and load the index.html of the app.
    win.setMenuBarVisibility(false);
    win.loadFile(path.join(__dirname, `./frontend/src/index.html`));
  } else if (page === "dashboard.html") {
    var gmailPage = new BrowserWindow({
      width: 1400,
      height: 879,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
      },
      icon: "./assets/purplicon.ico",
      frame: false,
      resizable: false,
    });
    gmailPage.setMenuBarVisibility(false);
    gmailPage.loadFile(path.join(__dirname, "./frontend/src/dashboard.html"));
    gmailPage.on("close", async () => {
      console.log("closing");
      await gmailFarmer.saveGmails();
      await proxy.saveProxies();
      await profiles.saveProfiles();
      app.quit();
    });
  }
  ipcMain.on("to-dashboard-page", function (event, arg) {
    gmailPage = new BrowserWindow({
      width: 1400,
      height: 879,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
      },
      icon: "./assets/purplicon.ico",
      frame: false,
      resizable: false,
    });
    win.close();
    gmailPage.setMenuBarVisibility(false);
    gmailPage.loadFile(path.join(__dirname, "./frontend/src/dashboard.html"));

    ipcMain.on("to-proxy-page", function (event) {
      console.log("loading proxies", "info");
      gmailPage.loadFile(path.join(__dirname, "./frontend/src/proxies.html"));
    });

    gmailPage.on("close", async () => {
      console.log("gmail close");
      await gmailFarmer.saveGmails();
      await proxy.saveProxies();
      await profiles.saveProfiles();
      app.quit();
    });
  });

  ipcMain.on("open-file-dialog", function (event, args) {
    dialog
      .showOpenDialog({
        properties: ["openFile"],
      })
      .then((result) => {
        console.log(result.filePaths[0]);
        console.log(args);
        if (!Array.isArray(args)) {
          console.log("testerrr");
          event.sender.send("import-gmails", result.filePaths[0]);
        } else if (args[0] === "profiles") {
          event.sender.send("profiles-import", result.filePaths[0], args[1]);
        }
      });
  });
}

app.whenReady().then(async () => {
  const code = await engine.setup();
  globalShortcut.register("CommandOrControl+R", () => {
    return;
  });
  if (code === 1 || process.env.NODE_ENV == "development") {
    console.log("skipping");
    createWindow("dashboard.html");
  } else {
    console.log("input key");
    createWindow("index.html");
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

//KEY PAGE IPC

//CAPTCHA IPC
ipcMain.on("action-specific", async (event, { gmail, group }) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Start/Stop specific`);
  const started = await gmailFarmer.actionSpecific(gmail, group);
  event.reply("action-specific-reply", { gmail, started, group });
});

ipcMain.on("copy-data", (event, { group, uuid, data }) => {
  //arg will have what data needs to be copied, just check that then paste on clipboard
  console.log(
    `[${new Date().toLocaleTimeString()}] - Copying ` + uuid + " " + data
  );
  gmailFarmer.copy(group, uuid, data);
});

ipcMain.on("manual-login", (event, { uuid, group }) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Manual login ${uuid}`);
  gmailFarmer.manualLogin(uuid, group);
});

ipcMain.on("test-gmails", (event, arg) => {
  //arg will contain what type of test needs to be done
});

ipcMain.on("load-gmails", async (event, { groupID, initial }) => {
  console.log(
    `[${new Date().toLocaleTimeString()}] - Loading Gmails from backend`
  );
  const defaultGmails = await gmailFarmer.loadGmails(initial, groupID);
  event.returnValue =
    typeof defaultGmails === "undefined"
      ? { gmails: "undefined" }
      : defaultGmails;
});

ipcMain.on("get-gmail", async (event, { gmailID, groupID }) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Getting gmail`);
  const theAccount = await gmailFarmer.getGmail(gmailID, groupID);
  event.returnValue = theAccount;
});

ipcMain.on(
  "edit-gmail",
  (
    event,
    { uuid, group, newGmail, newPass, newRecov, newSecurity, newProxy }
  ) => {
    console.log(
      `[${new Date().toLocaleTimeString()}] - Edit gmail ${newProxy} ` + uuid
    );
    gmailFarmer.editGmail(
      uuid,
      group,
      newGmail,
      newPass,
      newRecov,
      newSecurity,
      newProxy
    );
  }
);

ipcMain.on("delete-gmail", (event, { groupID, gmailID }) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Deleting`);
  gmailFarmer.deleteGmail(groupID, gmailID);
});

ipcMain.on("get-scores", async (event, { group, gmail, pos }) => {
  const scores = await gmailFarmer.getScores(group, gmail);

  event.reply("get-scores-reply", {
    scores,
    pos: { x_val: pos.x, y_val: pos.y },
  });
});

ipcMain.on("edit-group", (event, { name, tags, uuid }) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Edit group ` + uuid);
  gmailFarmer.editGroup(name, tags, uuid);
});

ipcMain.on("delete-group", (event, arg) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Delete group ` + arg);
  gmailFarmer.deleteGroup(arg);
});

ipcMain.on("start-all", (event, { groupID }) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Start all`);
  gmailFarmer.startAll(groupID);
});

ipcMain.on("stop-all", (event, { groupID }) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Stop all`);
  gmailFarmer.stopAll(groupID);
});

ipcMain.on(
  "new-gmail",
  async (event, { email, pass, recov, sec_q, proxy, groupID }) => {
    console.log(`[${new Date().toLocaleTimeString()}] - Making new gmail`);
    const gmail = await gmailFarmer.newGmail(
      email,
      pass,
      proxy,
      recov,
      sec_q,
      groupID
    );
    event.returnValue = gmail;
  }
);

ipcMain.on("new-group", async (event, { name, tags }) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Making new group`);
  const group = await gmailFarmer.addGroup(name, tags);
  event.returnValue = group;
});

ipcMain.on("import-gmails-path", (event, arg) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Importing gmails`);
  gmailFarmer.importFromFile(arg).then(async (groups) => {
    console.log("sending", groups);
    event.reply("import-gmails-path-reply", groups);
  });
});

ipcMain.on("get-proxies", async (event, { initial, group }) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Getting Proxies`);
  event.returnValue = await proxy.loadProxies(initial, group);
});

ipcMain.on("copy-proxies", (event, { sel, group }) => {
  proxy.copyProxies(sel, group);
});

ipcMain.on("delete-all-profiles", (event, arg) => {
  console.log(
    `[${new Date().toLocaleTimeString()}] - Deleting profiles from`,
    arg
  );
  profiles.deleteAll(arg);
});

ipcMain.on("delete-profile", (event, { uuid, group }) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Deleting profile`);
  profiles.deleteProfile(uuid, group);
});

ipcMain.on("get-profiles", async (event, { initial, group }) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Getting profiles`);
  const profs = await profiles.loadProfiles(initial, group);
  event.returnValue = profs;
  //sendsync
});

ipcMain.on("move-profiles", (event, { toGroup, fromGroup, uuids }) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Moving profiles`);
  profiles.moveProfiles(uuids, toGroup, fromGroup);
});

ipcMain.on(
  "vcc-actions",
  async (event, { service, action, qty, names, profileInfo }) => {
    const VC = new VCC_Controller(
      service,
      action,
      profileInfo.profile,
      profileInfo.group
    );

    const FinalProfiles = await VC.startTasks(names, qty);
    event.reply("vcc-actions-reply", FinalProfiles);
  }
);

ipcMain.on("copy-profiles", (event, { uuids, group }) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Copying profiles`);
  profiles.copyProfiles(uuids, group);
});

ipcMain.on("jig-profiles", async (event, { profilesToJig, options }) => {
  console.log(profilesToJig + " " + options);
  console.log(`[${new Date().toLocaleTimeString()}] - Jigging Profiles`);
  const jigged = await profiles.jigProfiles(profilesToJig, options);
  event.returnValue = jigged;
});

ipcMain.on("create-accounts", (event, { site, catchall, qty, proxyList }) => {
  const C = new Controller(site, catchall, proxyList, qty);
  C.startTasks();
});

ipcMain.on("delete-sel-profiles", (event, { uuids, group }) => {
  console.log(
    `[${new Date().toLocaleTimeString()}] - Deleting profiles`,
    uuids
  );
  profiles.deleteSelected(uuids, group);
});

ipcMain.on("delete-profile-group", (event, group) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Deleting group`);
  profiles.deleteGroup(group);
});

ipcMain.on("new-profile", async (event, { group, profile }) => {
  //sendsync
  console.log(`[${new Date().toLocaleTimeString()}] - Making new prof`);
  const newProf = await profiles.addProfile(profile, group);
  event.returnValue = newProf;
});

ipcMain.on("new-profile-group", async (event, arg) => {
  //sendsync
  console.log(
    `[${new Date().toLocaleTimeString()}] - Making new profile group`
  );
  const newGroup = await profiles.newGroup(arg);
  event.returnValue = newGroup;
});

ipcMain.on("export-profiles", (event, { profs, group, bot }) => {
  console.log(
    `[${new Date().toLocaleTimeString()}] - Exporting profiles ${profs}`
  );
  profiles.exportProfiles(profs, group, bot);
});

ipcMain.on("import-profiles", (event, { path, bot }) => {
  //sendsync
  console.log(`[${new Date().toLocaleTimeString()}] - Importing profiles`);
  profiles.importProfiles(path, bot, (returnVal) => {
    event.returnValue = returnVal;
  });
});

ipcMain.on("edit-proxy-group", (event, { name, uuid }) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Editing proxy group`);
  proxy.editGroup(name, uuid);
});

ipcMain.on("edit-profile-group", (event, { uuid, name }) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Editing profile group`);
  profiles.editGroup(uuid, name);
});

ipcMain.on("delete-proxy-group", (event, group) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Deleting proxy group`);
  proxy.deleteGroup(group);
});

ipcMain.on("add-proxy-group", async (event, name) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Adding proxy Group`);
  event.returnValue = await proxy.addGroup(name);
});

ipcMain.on("delete-proxy", (event, { groupID, proxy }) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Deleting proxy`);
  proxy.deleteProxy(proxy, groupID);
});

ipcMain.on("add-proxies", async (event, { proxies, group }) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Adding proxies`);
  event.reply("add-proxies-reply", await proxy.addProxies(proxies, group));
});

ipcMain.on("test-all-proxies", async (event, { group, site }) => {
  console.log(
    `[${new Date().toLocaleTimeString()}] - Testing group ${group} on site ${site}`
  );
  const prox = await proxy.loadProxies(false, group);
  const T = new Tester(prox, site, group);
  T.run();
});

ipcMain.on("delete-all-proxies", (event, group) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Deleting all proxies`);
  proxy.deleteAll(group);
});

ipcMain.on("get-totals-profits", async (event, { start, end, countUnsold }) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Getting Totals by dates`);
  const totalUnrealProfit = await profits.getUnrealProfit(
    countUnsold,
    start,
    end
  );
  const inventorySpend = await profits.getCurrentInventorySpend(start, end);
  const totalOrders = await profits.getInventoryOrders(start, end);
  const gross = await profits.getGross(start, end);
  const totalSales = await profits.getTotalSales(start, end);
  const getSoldSpend = await profits.getSoldSpend(start, end);
  const realProfit = await profits.getRealProfit(start, end);
  event.returnValue = {
    totalOrders: totalOrders + totalSales,
    totalShoeProfit: totalUnrealProfit + realProfit,
    gross,
    totalSpent: getSoldSpend + inventorySpend,
  };
});

ipcMain.on("get-filtered-grahps", async (event, { START_DATE, END_DATE }) => {
  const graphs = await profits.getFilteredGraphs(START_DATE, END_DATE);
});

ipcMain.on(
  "add-expense",
  async (event, { price, tax, shipping, name, type, qty, date }) => {
    console.log(`[${new Date().toLocaleTimeString()}] - Adding Expense`);
    const newExpense = await profits.addExpense(
      name,
      price,
      tax,
      shipping,
      date,
      qty,
      type
    );

    event.returnValue = newExpense;
  }
);

ipcMain.on("get-expenses", async (event, initial) => {
  const loadedExpenses = await profits.loadedExpenses(initial);
  event.returnValue = loadedExpenses;
});

ipcMain.on("stockx-search", async (event, query) => {
  console.log(
    `[${new Date().toLocaleTimeString()}] - Searching for ${query} on StockX`
  );
  const hits = await stockx.search(query);
  console.log(hits);
  event.reply("stockx-search-reply", hits);
});

ipcMain.on("stockx-login", (event, arg) => {
  console.log(`[${new Date().toLocaleTimeString()}] - Logging into stockx`);
  stockx.login();
});

ipcMain.on(
  "add-inventory",
  async (event, { sku, size, price, store, order, date, tags }) => {
    console.log(
      `[${new Date().toLocaleTimeString()}] - Adding Item to Inventory`
    );
    var newTags;
    if (!Array.isArray(tags)) {
      newTags = tags.includes(" ") ? tags.split(" ") : [tags];
    }
    const item = await profits.addItem(
      sku,
      size,
      price,
      store,
      date,
      order,
      newTags ? newTags : tags
    );
    event.returnValue = item;
  }
);

ipcMain.on("refresh-market", async (event, arg) => {
  const newInventory = await profits.refreshPrices();
  event.reply("refresh-market-reply", newInventory);
});

ipcMain.on("load-inventory", async (event, initial) => {
  const loaded = await profits.loadInventory(initial);
  event.returnValue = loaded;
});

ipcMain.on("load-sales", async (event, arg) => {
  const sales = await profits.loadSales(arg);
  event.returnValue = sales;
});

ipcMain.on(
  "new-sale",
  async (event, { item, price, shipping, platform, date }) => {
    const item1 = await profits.markAsSold(
      item,
      price,
      shipping,
      platform,
      date
    );
    event.returnValue = item1;
  }
);

ipcMain.on("request-gmail-statuses", async (event, arg) => {
  const statuses = await gmailFarmer.sendStatuses();
  event.reply("new-statuses", statuses);
});

ipcMain.on("test-gmails", (event, { gmails, group, type }) => {
  var results = new Array();
  gmails.forEach(async (gmail) => {
    if (gmail.running) {
      gmailFarmer.actionSpecific(gmail.uuid, group);
    }
    const res = await test.testGmail(gmail, group, type);
    const parsed = JSON.parse(res);
    if (!parsed.errors) {
      gmailFarmer.setScore(group, gmail, type, parsed.score);
    }
    results.push(parsed);
  });
  var testInt = setInterval(async () => {
    if (results.length === gmails.length) {
      event.reply("test-gmails-reply", results);
      clearInterval(testInt);
    }
  });
});

ipcMain.on(
  "save-settings",
  (event, { webhook, chrome, gmailToken, fiveSim, twoCap }) => {
    saveSettings(webhook, chrome, gmailToken, twoCap, fiveSim);
  }
);

ipcMain.on("get-settings", (event, arg) => {
  event.returnValue = getSettings();
});

ipcMain.on("activate", async (event, key) => {
  const res = await engine.sendKey(key);
  event.returnValue = res;
});

const sendSpeedsToFrontend = (uuid, speed) => {
  gmailPage.webContents.send("proxy-speed", { uuid, speed });
};

module.exports = {
  sendSpeedsToFrontend: sendSpeedsToFrontend,
};
