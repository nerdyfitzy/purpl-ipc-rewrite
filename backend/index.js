const io = require("socket.io-client");
const DiscordRPC = require("discord-rpc");
const clientId = "785264365963182121";
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const console = require("../backend/utils/logger");
dotenv.config();

const { machineId } = require("node-machine-id");
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

const sendKey = (key) => {
  socket.send(
    JSON.stringify({
      op: 1,
      key,
    })
  );
};

const startSocket = () => {
  const socket = io.connect("https://ancient-lake-42941.herokuapp.com/");
  socket.on("connect", async () => {
    console.log(
      `[${new Date().toLocaleTimeString()}] - Connected to API`,
      "info"
    );
    presence();
  });
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
          sock.send(
            JSON.stringify({
              skipKey: true,
            })
          );
          activated = true;
          globalInfo.startTime = Date.now();
        } else {
          console.log(
            `[${new Date().toLocaleTimeString()}] - No key in config. Must input`,
            "info"
          );
          sock.send(
            JSON.stringify({
              skipKey: false,
            })
          );
        }
        break;
      case 2:
        if (wsParsed.success === 1) {
          console.log(
            `[${new Date().toLocaleTimeString()}] - Successfully Activated!`,
            "info"
          );
          sock.send(
            JSON.stringify({
              success: 1,
            })
          );
          activated = true;
          let startTime = Date.now();
        } else {
          console.log(
            `[${new Date().toLocaleTimeString()}] - Error activating.`,
            "error"
          );
          sock.send(
            JSON.stringify({
              success: 0,
              reason: wsParsed.error,
            })
          );
        }

        break;
    }
  });
};

const setup = async () => {
  startSocket();
  if (!fs.existsSync(path.join(process.env.APPDATA, "purpl", "local-data"))) {
    console.log("files dont exist, making", "debug");
    fs.mkdirSync(path.join(process.env.APPDATA, "purpl", "local-data"));
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
      path.join(process.env.APPDATA, "purpl", "local-data", "exports", "gmails")
    );

    fs.writeFileSync(
      path.join(process.env.APPDATA, "purpl", "local-data", "config.json"),
      JSON.stringify({
        global: { webhook: "", activated: false, key: "" },
        gmailSettings: {
          maxRunning: 10,
          sleepinputlow: 300,
          sleepinputhigh: 480,
          runinputlow: 30,
          runinputhigh: 60,
        },
      })
    );
  }

  const config_unparsed = fs.readFileSync(
    path.join(process.env.APPDATA, "purpl", "local-data", "config.json")
  );
  const config = JSON.parse(config_unparsed);

  if (config.global.key !== "") {
    console.log(
      `[${new Date().toLocaleTimeString()}] - Key found in config (${
        config.global.key
      }), sending to server`,
      "info"
    );
    socket.send(
      JSON.stringify({
        op: 1,
        key: config.global.key,
      })
    );
    return 1;
  }
  console.log(`[${new Date().toLocaleTimeString()}] - No key found`, "info");
  return 0;
};

module.exports = {
  sendKey,
  setup,
};
