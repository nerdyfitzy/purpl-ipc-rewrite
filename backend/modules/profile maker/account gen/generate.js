const fs = require("fs");
const playwright = require("playwright");
const TargetAccount = require("./scripts/target_catchall");
const WalmartAccount = require("./scripts/walmart");
const { loadProxies } = require("../../proxies/index");
const path = require("path");
const AmazonGenerator = require("./amazon/generator/amzGen");

let next = 0;

const getNextUnusedProxy = () => {
  return next;
};

class Controller {
  constructor(site, catchall, proxyList, number) {
    const { misc } = JSON.parse(
      fs.readFileSync(
        path.join(process.env.APPDATA, "purpl", "local-data", "config.json")
      )
    );
    this.site = site;
    this.catchall = catchall;
    this.proxyList = proxyList;
    this.smsKey = misc.fivesim;
    this.captchaKey = misc.twoCaptcha;
    this.number = number;
    this.CreatedAccounts = [];
    this.context;
    this.page;
  }

  async rotateProxy() {
    const { proxies } = await loadProxies(false, this.proxyList);
    if (next >= Object.values(proxies).length) return false;
    const proxy = Object.values(proxies)[next].proxy.split(":");
    next++;
    this.context.close();
    this.context = await browser.newContext({
      headless: false,
      proxy: {
        server: "http://" + proxy[0] + ":" + proxy[1],
        username: proxy[2],
        password: proxy[3],
      },
    });
    this.page = await this.context.newPage();

    return true;
  }

  exportAccounts() {
    console.log("Exporting accounts");
    if (
      !fs.existsSync(
        path.join(
          process.env.APPDATA,
          "purpl",
          "local-data",
          "exports",
          "accounts",
          this.site
        )
      )
    ) {
      fs.mkdirSync(
        path.join(
          process.env.APPDATA,
          "purpl",
          "local-data",
          "exports",
          "accounts",
          this.site
        )
      );
    }
    let dateob = new Date();
    console.log(this.CreatedAccounts.join("\n"));
    fs.writeFileSync(
      path.join(
        process.env.APPDATA,
        "purpl",
        "local-data",
        "exports",
        "accounts",
        this.site,
        `${this.site} accounts (${dateob.getFullYear()}-${(
          "0" +
          (dateob.getMonth() + 1)
        ).slice(-2)}-${("0" + dateob.getDate()).slice(-2)}).txt`
      ),
      this.CreatedAccounts.join("\n")
    );
    require("child_process").exec(
      `start "" "${path.join(
        process.env.APPDATA,
        "purpl",
        "local-data",
        "exports",
        "accounts",
        this.site
      )}"`
    );

    this.context.close();
  }

  async startTasks(profileId = "", groupId = "") {
    switch (this.site) {
      case "Target": {
        for (let i = 0; i < this.number; i++) {
          const browser = await playwright["firefox"].launch({
            headless: true,
            proxy: { server: "per-context" },
          });
          const proxies = await loadProxies(false, this.proxyList);
          console.log(Object.values(proxies));
          const proxy = Object.values(proxies)[next].proxy.split(":");

          this.context = await browser.newContext({
            headless: true,
            proxy: {
              server: "http://" + proxy[0] + ":" + proxy[1],
              username: proxy[2],
              password: proxy[3],
            },
          });
          this.page = await this.context.newPage();
          const Account = new TargetAccount(this.catchall, this.page);
          const Success = await Account.generate();
          console.log(Success);
          if (Success) {
            this.CreatedAccounts.push(Account.getDetails());
          } else {
            const outOfProxies = await this.rotateProxy();
            if (outOfProxies) return this.exportAccounts();
          }

          await this.context.close();
        }
        break;
      }
      case "Walmart": {
        for (let i = 0; i < this.number; i++) {
          const browser = await playwright["firefox"].launch({
            headless: false,
            proxy: { server: "per-context" },
          });
          const proxies = await loadProxies(false, this.proxyList);
          console.log(Object.values(proxies));
          const proxy = Object.values(proxies)[next].proxy.split(":");

          this.context = await browser.newContext({
            headless: false,
            proxy: {
              server: "http://" + proxy[0] + ":" + proxy[1],
              username: proxy[2],
              password: proxy[3],
            },
          });
          this.page = await this.context.newPage();
          const Account = new WalmartAccount(this.catchall, this.page);
          const Success = await Account.generate();
          if (Success) {
            console.log("Successfully reported");
            this.CreatedAccounts.push(Account.getDetails());
          } else {
            console.log("Failed");
            const outOfProxies = await this.rotateProxy();
            if (outOfProxies) return this.exportAccounts();
          }

          await this.context.close();
        }
        break;
      }
      case "Amazon": {
        for (let i = 0; i < this.number; i++) {
          const Amazon = new AmazonGenerator(
            this.catchall,
            profileId,
            groupId,
            this.smsKey,
            this.captchaKey
          );
          const acc = await Amazon.start();
          if (acc) {
            this.CreatedAccounts.push(acc);
          }
        }
        break;
      }
    }
    this.exportAccounts();
  }
}

module.exports = { getNextUnusedProxy, Controller };
