const fs = require("fs");
const path = require("path");

const saveSettings = (webhook, chromePath, gmailToken, twoCaptcha, fivesim) => {
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
    path.join(
      process.env.APPDATA,
      "purpl",
      "local-data",
      "config.json",
      JSON.stringify(newSettings)
    )
  );
};

const getSettings = () => {
  return JSON.parse(
    fs.readFileSync(
      path.join(process.env.APPDATA, "purpl", "local-data", "config.json")
    )
  );
};

module.exports = { saveSettings, getSettings };
