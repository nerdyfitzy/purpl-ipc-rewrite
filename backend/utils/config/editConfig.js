const fs = require("fs");
const path = require("path");
const GmailScanner = require("../gmail scanning/auth");
const console = require("../../utils/logger");

const saveSettings = async (
  webhook = false,
  chromePath = false,
  gmailToken = false,
  twoCaptcha = false,
  fivesim = false,
  authorizedToken = false
) => {
  console.log("saving settings");
  const oldSettings = JSON.parse(
    fs.readFileSync(
      path.join(process.env.APPDATA, "purpl", "local-data", "config")
    )
  );
  if (gmailToken && oldSettings.misc.authorizedToken !== "") {
    const scan = new GmailScanner();
    await scan.getOauth2();
    return 1;
  }
  const newSettings = {
    global: {
      webhook: webhook ? webhook : oldSettings.global.webhook,
      activated: false,
      key: "",
      chromePath: chromePath ? chromePath : oldSettings.global.chromePath,
    },
    gmailSettings: {
      maxRunning: 10,
      sleepinputlow: 300,
      sleepinputhigh: 480,
      runinputlow: 30,
      runinputhigh: 60,
    },

    misc: {
      gmailToken: gmailToken ? gmailToken : oldSettings.misc.gmailToken,
      fivesim: fivesim ? fivesim : oldSettings.misc.fivesim,
      twoCaptcha: twoCaptcha ? twoCaptcha : oldSettings.misc.twoCaptcha,
      authorizedToken: authorizedToken
        ? authorizedToken
        : oldSettings.misc.authorizedToken,
    },
  };
  fs.writeFileSync(
    path.join(process.env.APPDATA, "purpl", "local-data", "config.json"),
    JSON.stringify(newSettings)
  );
};

const getSettings = () => {
  console.log("getting settings");
  return JSON.parse(
    fs.readFileSync(
      path.join(process.env.APPDATA, "purpl", "local-data", "config.json")
    )
  );
};

module.exports = { saveSettings, getSettings };
