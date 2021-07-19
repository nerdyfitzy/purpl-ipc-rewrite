const fs = require("fs");
const { v4 } = require("uuid");

const ex = require("./exports");
const im = require("./imports");

const path = require("path");
const names = require("node-random-name");

const console = require("../../../utils/logger");

let groups = {
  default: {
    name: "default",
    uuid: "default",
    profiles: {},
  },
};

const imports = {
  "Project Destroyer": im.pd,
  Cybersole: im.cyber,
  Dashe: im.dashe,
  Kodai: im.kodai,
  Phantom: im.phantom,
  CSV: im.csv1,
  Purpl: im.purpl,
  AYCD: im.aycd,
  Balkobot: im.balko,
  Ganesh: im.ganesh,
  Kage: im.kage,
  NSB: im.nsb,
  Phantom: im.phantom,
  Polaris: im.polaris,
  Prism: im.prism,
  Nebula: im.nebula,
  Wrath: im.wrath,
};

const exportFuncs = {
  Cybersole: ex.cyber,
  Dashe: ex.dashe,
  Ganesh: ex.ganesh,
  Nebula: ex.nebula,
  Balkobot: ex.balko,
  Hawk: ex.hawk,
  Kage: ex.kage,
  Lex: ex.lex,
  NSB: ex.nsb,
  Polaris: ex.polaris,
  Prism: ex.prism,
  MEKAIO: ex.mekaio,
  Splashforce: ex.splashforce,
  "RE AIO": ex.re,
  Estock: ex.estock,
  Rush: ex.rush,
  Wrath: ex.wrath,
  Torpedo: ex.torpedo,
  Linear: ex.linear,
  Trickle: ex.trickle,
  Kodai: ex.kodai,
  Hayha: ex.hayha,
  KSR: ex.ksr,
  Noble: ex.noble,
  Ominous: ex.ominous,
  Kylin: ex.kylin,
  TSB: ex.tsb,
  Stellar: ex.stellar,
  Valor: ex.valor,
  Velox: ex.velox,
  Whatbot: ex.whatbot,
};

const fileExtensions = {
  Cybersole: "json",
  Dashe: "json",
  Ganesh: "csv",
  Nebula: "json",
  Balkobot: "json",
  Hawk: "csv",
  Kage: "csv",
  Lex: "json",
  NSB: "json",
  Polaris: "json",
  Prism: "json",
  MEKAIO: "json",
  Splashforce: "json",
  "RE AIO": "csv",
  Estock: "json",
  Rush: "csv",
  Wrath: "json",
  Torpedo: "json",
  Linear: "json",
  Trickle: "csv",
  Kodai: "txt",
  KSR: "json",
  Noble: "json",
  Ominous: "json",
  Kylin: "json",
  Stellar: "json",
  TSB: "json",
  Valor: "json",
  Velox: "json",
  Whatbot: "csv",
};

const saveProfiles = async () => {
  fs.writeFileSync(
    path.join(process.env.APPDATA, "purpl", "local-data", "profiles.json"),
    JSON.stringify(groups)
  );
  console.log(`[${new Date().toLocaleTimeString()}] - Saved Profiles!`, "info");
  return;
};

const getProfile = (profile, group) => {
  return groups[group].profiles[profile];
};

const newGroup = (name) => {
  const uuid = v4();
  groups[uuid] = {
    uuid: uuid,
    name: name,
    profiles: {},
  };
  saveProfiles();
  return groups[uuid];
};

const addProfile = (profile, group) => {
  return new Promise((resolve, reject) => {
    const uuid = v4();
    profile.uuid = uuid;
    groups[group].profiles[uuid] = profile;
    saveProfiles();
    resolve(uuid);
  });
};

const loadProfiles = (fromfile, group = false) => {
  if (fromfile) {
    if (
      !fs.existsSync(
        path.join(process.env.APPDATA, "purpl", "local-data", "profiles.json")
      )
    )
      return groups;
    console.log(
      `[${new Date().toLocaleTimeString()}] - Loading From JSON`,
      "info"
    );
    let temp = fs.readFileSync(
      path.join(process.env.APPDATA, "purpl", "local-data", "profiles.json")
    );
    groups = JSON.parse(temp);
    return JSON.parse(temp);
  } else {
    console.log(
      `[${new Date().toLocaleTimeString()}] - Loading Group` +
        groups[group].name,
      "info"
    );
    return groups[group];
  }
};

const deleteProfile = (prof, group) => {
  delete groups[group].profiles[prof];
  saveProfiles();
};

const importProfiles = async (file, bot, fn) => {
  const importGroup = await newGroup(`${bot} Import`);
  if (typeof file === "undefined" || typeof bot === "undefined") {
    fn(undefined);
    return;
  }
  if (bot.substring(bot.length - 3).toLowerCase() === "csv") {
    imports[bot](file, async function (res) {
      for (const prof in res) {
        await addProfile(res[prof], importGroup.uuid);
      }
      fn(groups[importGroup.uuid]);
    });
  } else {
    try {
      const profiles = await imports[bot](file);
      for (const profile of Object.values(profiles)) {
        await addProfile(profile, importGroup.uuid);
      }
      fn(groups[importGroup.uuid]);
    } catch (e) {
      console.log(e, "error");
    }
  }
};

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const numbers = "1234567890";
const aptJigs = ["Unit", "Block", "Num", "A1", "Apt"];
const jigProfiles = (profiles, options) => {
  const { group, uuids } = profiles;
  for (const id of uuids) {
    if (options.RANDOM_LETTERS.checked) {
      const { amount, position } = options.RANDOM_LETTERS;
      var randomstring = "";
      for (let i = 0; i < amount; i++) {
        randomstring += letters.charAt(Math.random() * letters.length - 1);
      }
      groups[group].profiles[id].shipping.addy1 =
        position === "before"
          ? randomstring + " " + groups[group].profiles[id].shipping.addy1
          : groups[group].profiles[id].shipping.addy1 + " " + randomstring;
      groups[group].profiles[id].billing.addy1 =
        position === "before"
          ? randomstring + " " + groups[group].profiles[id].billing.addy1
          : groups[group].profiles[id].billing.addy1 + " " + randomstring;
    }
    if (options.RANDOM_APT.checked) {
      const { position } = options.RANDOM_APT;
      const random = Math.random() * aptJigs.length;
      switch (aptJigs[random]) {
        case "Unit": {
          const jig =
            "Unit " + numbers.charAt(Math.random() * (numbers.length - 1));
          groups[group].profiles[id].shipping[position] =
            groups[group].profiles[id].shipping[position] !== ""
              ? groups[group].profiles[id].shipping[position] + " " + jig
              : jig;

          groups[group].profiles[id].billing[position] =
            groups[group].profiles[id].billing[position] !== ""
              ? groups[group].profiles[id].billing[position] + " " + jig
              : jig;
          break;
        }

        case "Block": {
          const jig =
            "Block " + numbers.charAt(Math.random() * (numbers.length - 1));
          groups[group].profiles[id].shipping[position] =
            groups[group].profiles[id].shipping[position] !== ""
              ? groups[group].profiles[id].shipping[position] + " " + jig
              : jig;
          groups[group].profiles[id].billing[position] =
            groups[group].profiles[id].billing[position] !== ""
              ? groups[group].profiles[id].billing[position] + " " + jig
              : jig;
          break;
        }

        case "Num": {
          const jig =
            "Num " + numbers.charAt(Math.random() * (numbers.length - 1));
          groups[group].profiles[id].shipping[position] =
            groups[group].profiles[id].shipping[position] !== ""
              ? groups[group].profiles[id].shipping[position] + " " + jig
              : jig;
          groups[group].profiles[id].billing[position] =
            groups[group].profiles[id].billing[position] !== ""
              ? groups[group].profiles[id].billing[position] + " " + jig
              : jig;
          break;
        }

        case "A1": {
          const jig =
            letters.charAt(Math.random() * letters.length - 1) +
            numbers.charAt(Math.random() * (numbers.length - 1));
          groups[group].profiles[id].shipping[position] =
            groups[group].profiles[id].shipping[position] !== ""
              ? groups[group].profiles[id].shipping[position] + " " + jig
              : jig;
          groups[group].profiles[id].billing[position] =
            groups[group].profiles[id].billing[position] !== ""
              ? groups[group].profiles[id].billing[position] + " " + jig
              : jig;
          break;
        }

        case "Apt": {
          const jig =
            "Apt " + numbers.charAt(Math.random() * (numbers.length - 1));
          groups[group].profiles[id].shipping[position] =
            groups[group].profiles[id].shipping[position] !== ""
              ? groups[group].profiles[id].shipping[position] + " " + jig
              : jig;

          groups[group].profiles[id].billing[position] =
            groups[group].profiles[id].billing[position] !== ""
              ? groups[group].profiles[id].billing[position] + " " + jig
              : jig;
          break;
        }

        default: {
          const jig =
            "Apt " + numbers.charAt(Math.random() * (numbers.length - 1));
          groups[group].profiles[id].shipping[position] =
            groups[group].profiles[id].shipping[position] !== ""
              ? groups[group].profiles[id].shipping[position] + " " + jig
              : jig;

          groups[group].profiles[id].billing[position] =
            groups[group].profiles[id].billing[position] !== ""
              ? groups[group].profiles[id].billing[position] + " " + jig
              : jig;
          break;
        }
      }
    }
    if (options.RANDOM_FNAME) {
      const lnameShipping =
        groups[group].profiles[id].shipping.name.split(" ")[1];
      const lnameBilling =
        groups[group].profiles[id].billing.name.split(" ")[1];
      groups[group].profiles[id].shipping.name =
        names({ first: true }) + " " + lnameShipping;
      groups[group].profiles[id].billing.name =
        names({ first: true }) + " " + lnameBilling;
    }
    if (options.RANDOM_LNAME) {
      const fnameShipping =
        groups[group].profiles[id].shipping.name.split(" ")[0];
      const fnameBilling =
        groups[group].profiles[id].billing.name.split(" ")[0];
      groups[group].profiles[id].shipping.name =
        fnameShipping + " " + names({ last: true });
      groups[group].profiles[id].billing.name =
        fnameBilling + " " + names({ last: true });
    }
    if (options.RANDOM_PHONE) {
      var randomPhoneNumber = "";
      for (let i = 1; i <= 7; i++) {
        randomPhoneNumber += numbers.charAt(
          Math.random() * (numbers.length - 1)
        );
      }
      groups[group].profiles[id].shipping.phone =
        groups[group].profiles[id].shipping.phone.substring(0, 3) +
        randomPhoneNumber;
      groups[group].profiles[id].billing.phone =
        groups[group].profiles[id].billing.phone.substring(0, 3) +
        randomPhoneNumber;
    }
  }
  saveProfiles();
  return groups[group];
};

const deleteSelected = (uuids, currentgroup) => {
  for (const uuid of uuids) {
    delete groups[currentgroup].profiles[uuid];
  }
  saveProfiles();
};

const exportProfiles = async (profs, group, bot) => {
  console.log(bot, "info");
  let exports = new Array();
  if (profs === null) {
    for (const profile in groups[group].profiles) {
      await exports.push(groups[group].profiles[profile]);
    }
  } else {
    for (const uuid of profs) {
      await exports.push(groups[group].profiles[uuid]);
    }
  }
  const converted = await exportFuncs[bot](exports);
  let dir = path.join(
    process.env.APPDATA,
    "purpl",
    "local-data",
    "exports",
    "profiles",
    bot
  );
  let now = Date.now().toString();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  fs.mkdirSync(path.join(dir, now));
  if (bot === "Hayha") {
    fs.mkdirSync(path.join(dir, now, "Hayha"));
    for (const prof of converted) {
      fs.writeFileSync(
        path.join(dir, now, "Hayha", `${prof.profilename}.hayha`),
        JSON.stringify(prof)
      );
    }
  } else {
    fs.writeFileSync(
      path.join(dir, now, `${bot}.${fileExtensions[bot]}`),
      JSON.stringify(converted)
    );
  }

  require("child_process").exec(`start "" "${path.join(dir, now)}"`);
};

const editGroup = (uuid, name) => {
  groups[uuid].name = name;
  saveProfiles();
};

const copyProfiles = async (profiles, group) => {
  let newU = new Array();
  for (const profile of profiles) {
    const u = await addProfile(groups[group].profiles[profile], group);
    newU.push(groups[group].profiles[u]);
  }
  saveProfiles();
  return newU;
};

const moveProfiles = (uuids, toGroup, fromGroup) => {
  for (const uuid of uuids) {
    groups[toGroup].profiles[uuid] = groups[fromGroup].profiles[uuid];
    delete groups[fromGroup].profiles[uuid];
  }
  saveProfiles();
};

const getGroups = () => {
  return groups;
};

const deleteAll = (group) => {
  for (const prof in groups[group].profiles) {
    delete groups[group].profiles[prof];
  }
  saveProfiles();
};

const deleteGroup = (group) => {
  delete groups[group];
  saveProfiles();
};

loadProfiles(true);

module.exports = {
  loadProfiles: loadProfiles,
  deleteGroup: deleteGroup,
  deleteProfile: deleteProfile,
  addProfile: addProfile,
  importProfiles: importProfiles,
  saveProfiles: saveProfiles,
  exportProfiles: exportProfiles,
  newGroup: newGroup,
  deleteSelected: deleteSelected,
  copyProfiles: copyProfiles,
  getGroups: getGroups,
  moveProfiles: moveProfiles,
  deleteAll: deleteAll,
  deleteGroup: deleteGroup,
  jigProfiles: jigProfiles,
  getProfile: getProfile,
  editGroup: editGroup,
};
