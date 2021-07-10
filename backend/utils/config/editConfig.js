const fs = require("fs");
const path = require("path");

const saveSettings = (webhook, chromePath, gmailToken, twoCaptcha, fivesim) => {
  console.log("saving settings");
  const newSettings = {
    global: {
      webhook,
      activated: false,
      key: "",
      chromePath,
    },
    gmailSettings: {
      maxRunning: 10,
      sleepinputlow: 300,
      sleepinputhigh: 480,
      runinputlow: 30,
      runinputhigh: 60,
    },

    misc: {
      gmailToken,
      fivesim,
      twoCaptcha,
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
