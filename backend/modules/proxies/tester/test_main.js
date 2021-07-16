const fs = require("fs");
const got = require("got");
const console = require("../../../utils/logger");
const { HttpsProxyAgent } = require("hpagent");
const { ipcMain } = require("electron");
const { setSpeed } = require("../proxies");
const { sendSpeedsToFrontend } = require("../../../../index");

let chunks = [];
let completed = 0;
let chunksCompleted = 0;
const times = {};

class Tester {
  constructor(proxyList, site, group) {
    this.unFormatted = proxyList;
    this.proxyGroup = group;
    this.proxyToUuidMap = {};
    this.formattedProxies = [];
    this.site = site;
    const uuids = Object.keys(proxyList);
    this.proxies = Object.values(proxyList).map((p) => p.proxy);
    for (let i = 0; i < uuids.length; i++) {
      this.proxyToUuidMap[this.proxies[i]] = uuids[i];
    }
  }

  formatProxies() {
    this.proxies.forEach((proxy) => {
      const [ip, port, user, pass] = proxy.split(":");
      this.formattedProxies.push({ ip, port, user, pass });
    });
  }

  async test(p, site) {
    let proxy = `${p.ip}:${p.port}`;
    if (p.user) proxy = `${p.user}:${p.pass}@${proxy}`;
    proxy = `http://${proxy}`;
    const start = new Date().getTime();
    try {
      const res = await got.get(site, {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        agent: {
          https: new HttpsProxyAgent({
            keepAlive: true,
            keepAliveMsecs: 1000,
            maxSockets: 256,
            maxFreeSockets: 256,
            scheduling: "lifo",
            proxy,
          }),
        },
      });
      const end = new Date().getTime();
      setSpeed(
        this.proxyToUuidMap[Object.values(p).join(":")],
        this.proxyGroup,
        end - start
      );
      console.log(
        `Set speed ${end - start} for proxy ${p.ip}:${p.port}:${p.user}:${
          p.pass
        }`,
        "info"
      );
      return 1;
    } catch (e) {
      console.log(e);
      setSpeed(this.proxyToUuidMap[p], this.proxyGroup, "Dead");
      return 0;
    }
  }

  async run() {
    this.formatProxies();
    for (let i = 0; i < this.formattedProxies.length; i += 100) {
      const promises = this.formattedProxies
        .map((proxy) => this.test(proxy, this.site))
        .slice(i, i + 100);
      setTimeout(async () => {
        await Promise.all(promises);
      }, 500);
    }
  }
}

module.exports = Tester;
