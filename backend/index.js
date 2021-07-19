const io = require("socket.io-client");
const DiscordRPC = require("discord-rpc");
const clientId = "785264365963182121";
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const console = require("./utils/logger");
const { ipcRenderer } = require("electron");
dotenv.config();

const { machineId } = require("node-machine-id");
const { saveSettings } = require("./utils/config/editConfig");
const { resolve } = require("path");
let authenticated = false;

const setActivity = (rpc) => {
  rpc.setActivity({
    details: "Alpha",
    state: "Automation Done Better",
    startTimestamp: Date.now(),
    largeImageKey: "purpl",
    largeImageText: "saving time.",
    smallImageKey: "purpl_captcha",
    smallImageText: "farming gmails",
    instance: true,
  });
};

const presence = () => {
  const rpc = new DiscordRPC.Client({ transport: "ipc" });
  rpc.login({ clientId }).catch(console.error);
  rpc.on("ready", () => {
    setActivity(rpc);
    console.log(
      `[${new Date().toLocaleTimeString()}] - Set Discord Presence`,
      "info"
    );
  });
};

var socket;

const sendKey = (key) => {
  return new Promise(async (resolve, reject) => {
    socket.on("message", (message) => {
      const wsParsed = JSON.parse(message);
      console.log(`Received msg from server, ${wsParsed}`, "debug");
      switch (wsParsed.op) {
        case 1:
          if (wsParsed.hwId === myHwid) {
            console.log(
              `[${new Date().toLocaleTimeString()}] - Key found in config, skipping key page`,
              "info"
            );

            activated = true;
            globalInfo.startTime = Date.now();
          } else {
            console.log(
              `[${new Date().toLocaleTimeString()}] - No key in config. Must input`,
              "info"
            );
          }
          break;
        case 2:
          if (wsParsed.success === 1) {
            console.log(
              `[${new Date().toLocaleTimeString()}] - Successfully Activated!`,
              "info"
            );
            saveSettings(false, false, false, false, false, key);
            resolve({ success: 1 });
            activated = true;
            let startTime = Date.now();
          } else {
            console.log(
              `[${new Date().toLocaleTimeString()}] - Error activating.`,
              "error"
            );
            resolve({ success: 0, reason: wsParsed.error });
          }

          break;
      }
    });
    const hwid = await machineId();
    socket.send(
      JSON.stringify({
        op: 1,
        key,
        hwid,
      })
    );
  });
};

const startSocket = () => {
  socket = io.connect("https://ancient-lake-42941.herokuapp.com/");
  socket.on("connect", async () => {
    console.log(
      `[${new Date().toLocaleTimeString()}] - Connected to API`,
      "info"
    );
    presence();
  });

  return 1;
};

const setup = () => {
  return new Promise(async (resolve, reject) => {
    startSocket();
    if (
      !fs.existsSync(path.join(process.env.APPDATA, "purpl", "local-data")) ||
      !fs.existsSync(
        path.join(process.env.APPDATA, "purpl", "local-data", "config.json")
      )
    ) {
      console.log("files dont exist, making");
      // fs.mkdirSync(path.join(process.env.APPDATA, "purpl", "local-data"));
      fs.mkdirSync(
        path.join(process.env.APPDATA, "purpl", "local-data", "exports")
      );
      fs.mkdirSync(
        path.join(
          process.env.APPDATA,
          "purpl",
          "local-data",
          "exports",
          "accounts"
        )
      );
      fs.mkdirSync(
        path.join(
          process.env.APPDATA,
          "purpl",
          "local-data",
          "exports",
          "profiles"
        )
      );
      fs.mkdirSync(
        path.join(
          process.env.APPDATA,
          "purpl",
          "local-data",
          "exports",
          "gmails"
        )
      );

      fs.writeFileSync(
        path.join(process.env.APPDATA, "purpl", "local-data", "config.json"),
        JSON.stringify({
          global: {
            webhook: "",
            activated: false,
            key: "",
            chromePath:
              "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
          },
          gmailSettings: {
            maxRunning: 10,
            sleepinputlow: 300,
            sleepinputhigh: 480,
            runinputlow: 30,
            runinputhigh: 60,
          },

          misc: {
            gmailToken: "",
            fivesim: "",
            twoCaptcha: "",
            authorizedToken: "",
          },
        })
      );
    }
    const config_unparsed = fs.readFileSync(
      path.join(process.env.APPDATA, "purpl", "local-data", "config.json")
    );
    const config = JSON.parse(config_unparsed);

    if (process.env.NODE_ENV === "development") {
      resolve(1);
      return;
    }

    if (config.global.key !== "") {
      console.log(
        `[${new Date().toLocaleTimeString()}] - Key found in config (${
          config.global.key
        }), sending to server`,
        "info"
      );
      const hwid = await machineId();
      socket.send(
        JSON.stringify({
          op: 1,
          key: config.global.key,
          hwid,
        })
      );
      socket.on("message", (message) => {
        const wsParsed = JSON.parse(message);
        console.log(
          `Received msg from server, ${JSON.stringify(wsParsed)}`,
          "debug"
        );
        switch (wsParsed.op) {
          case 2:
            if (wsParsed.success === 1) {
              console.log(
                `[${new Date().toLocaleTimeString()}] - Successfully Activated!`,
                "info"
              );
              resolve(1);
              activated = true;
            } else {
              console.log(
                `[${new Date().toLocaleTimeString()}] - Error activating.`,
                "error"
              );
              resolve(0);
            }

            break;
        }
      });
    } else {
      console.log(
        `[${new Date().toLocaleTimeString()}] - No key found`,
        "info"
      );
      resolve(0);
    }
  });
};

module.exports = {
  sendKey,
  setup,
};
