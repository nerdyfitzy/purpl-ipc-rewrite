const inventory = [];
const botbroker = require("modules\\bot flipping\\botbroker.js");
const discord = require("modules\\bot flipping\\autopost.js");
/*
    NAMES ARE:
    cyber (bb)
    tohru (bb)
    mekpreme (bb)
    mekaio (bb)
    balko (bb)
    nebula (bb)
    polaris (bb)
    dashe (bb)
    wrath (bb)
    splashforce (bb)
    pd (bb)
    prism (bb)
    phantom (bb)
    velox (bb)
    scottbot (bb)
    swft (bb)
    zeny
    burst
    estock
    eve
    f3
    flare
    fleek
    galaxs
    ganesh
    hawk
    hayha
    kodai
    kilo
    launcher
    mbot
    phasma
    reaio
    sole
    solyd
    sypion
    tks
    torpedo
    valor
*/
const botbrokerBots = [
  "cyber",
  "tohru",
  "mekpreme",
  "mekaio",
  "balko",
  "nebula",
  "polaris",
  "dashe",
  "wrath",
  "splashforce",
  "pd",
  "prism",
  "phantom",
  "velox",
  "scottbot",
  "swft",
];
const options = {
  cyber: {
    life: "Lifetime",
    renew: "133.15/6",
  },
  tohru: {
    life: "Lifetime",
    renew: "10/1",
  },
  mekpreme: {
    life: "Lifetime",
    renew: "60/6",
  },
  mekaio: {
    life: "Lifetime",
    renew: "60/6",
  },
  balko: {
    life: "Lifetime",
    yearly: "360/12",
    sixty: "60/6",
    forty: "40/6",
  },
  nebula: {
    life: "Lifetime",
    renew: "35/1",
  },
  polaris: {
    life: "Lifetime",
    renew: "119.64/6",
  },
  dashe: {
    life: "Lifetime",
    renew: "50/1",
  },
  wrath: {
    life: "Lifetime",
    sixmonth: "???",
    monthly: "50/1",
  },
  splashforce: {
    life: "Lifetime",
    renew: "60/6",
  },
  pd: {
    life: "Lifetime",
    sixmonth: "150/6",
    onemonth: "35/1",
  },
  prism: {
    life: "Lifetime",
    renew: "150/3",
  },
  phantom: {
    life: "Lifetime",
    onefifty: "150/6",
    sixty: "60/6",
  },
  velox: {
    life: "Lifetime",
  },
  scottbot: {
    life: "Lifetime",
  },
  swft: {
    life: "Lifetime",
  },
  zeny: {
    life: "Lifetime",
    renew: "20/1",
  },
  burst: {
    life: "Lifetime",
  },
  estock: {
    life: "Lifetime",
    renew: "35/1",
  },
  eve: {
    life: "Lifetime",
    renew: "50/1",
  },
  f3: {
    life: "Lifetime",
    renew: "100/6",
  },
  flare: {
    life: "Lifetime",
    renew: "35.89/1",
  },
  fleek: {
    life: "Lifetime",
    renew: "119.64/6",
  },
  galaxs: {
    life: "Lifetime",
  },
  ganesh: {
    life: "Lifetime",
    renew: "",
  },
  hawk: {
    life: "Lifetime",
    renew: "",
  },
  hayha: {
    life: "Lifetime",
    renew: "35/1",
  },
  kodai: {
    renew: "35/1",
  },
  kilo: {
    life: "Lifetime",
  },
  launcher: {
    life: "Lifetime",
  },
  mbot: {
    life: "Lifetime",
  },
  phasma: {
    life: "Lifetime",
  },
  reaio: {
    life: "Lifetime",
  },
  sole: {
    life: "Lifetime",
    renew: "149.55/6",
  },
  solyd: {
    life: "Lifetime",
  },
  sypion: {
    life: "Lifetime",
  },
  tks: {
    life: "Lifetime",
    renew: "60/6",
  },
  torpedo: {
    life: "Lifetime",
    renew: "100/3",
  },
  valor: {
    life: "Lifetime",
  },
};

const average = async (nums) => {
  let total;
  for (num of nums) {
    total += num;
  }
  return total / nums.length;
};

//mm/dd/yyyy => unix
const convertDateToUnix = (raw) => {
  const split = raw.split("/");
  const dateNew = new Date(`${split[2]}.${split[0]}.${split[1]}`);
  return dateNew.getTime() / 1000;
};

const addBot = async (name, buyprice, buy_date, renew_date, type) => {
  if (botbrokerBots.includes(name)) {
    if (name === "balko" || name === "pd" || name === "phantom") {
      botbroker.getSales(name, type).then((sale) => {
        return {
          name: name,
          buy: buyprice,
          market: sale,
          unrealized: sale - buyprice,
          buydate: convertDateToUnix(buy_date),
        };
      });
    } else {
      //for bots with multiple types of renewals, need to see how bb organizes
    }
  } else {
    discord.getListings("botmart", name, wtb, 7).then(async (listings) => {
      let market = await average(listings);
      return {
        name: name,
        buy: buyprice,
        market: market,
        unrealized: market - buyprice,
        buydate: buy_date,
      };
    });
  }
};
