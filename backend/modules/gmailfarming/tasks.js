//meant to handle all gmail tasks
const { Worker, isMainThread, parentPort } = require("worker_threads");
const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");
const uuid = require("uuid");
const clipboardy = require("clipboardy");
const console = require("../../utils/logger");

const { gmailSettings } = fs.existsSync(
  path.join(process.env.APPDATA, "purpl", "local-data", "config.json")
)
  ? require(path.join(
      process.env.APPDATA,
      "purpl",
      "local-data",
      "config.json"
    ))
  : {
      gmailSettings: {
        maxRunning: 10,
        sleepinputlow: 300,
        sleepinputhigh: 480,
        runinputlow: 30,
        runinputhigh: 60,
      },
    };
//gmails loaded into the bot

let groups = {
  default: {
    uuid: "default",
    name: "default",
    tags: "purpl default group",
    gmails: {},
  },
};

//max amount of running gmails
const maxRunning = gmailSettings.maxRunning;

//user input for sleep time amounts (minutes)
const sleepinputlow = gmailSettings.sleepinputlow;
const sleepinputhigh = gmailSettings.sleepinputhigh;

//user input for run time amounts (minutes)
const runinputlow = gmailSettings.runinputhigh;
const runinputhigh = gmailSettings.runinputlow;

//queued gmails
let queued = new Array();
const threads = new Set();
const interests = ["gaming", "cooking", "tech", "fashion", "shoes"];

const copy = (group, gmail, thing) => {
  clipboardy.writeSync(groups[group].gmails[gmail][thing]);
};

//GROUP FUNCTIONS
const addGroup = (name, tags) => {
  const groupuuid = uuid.v4();
  groups[groupuuid] = {
    uuid: groupuuid,
    name: name,
    tags: tags,
    gmails: {},
  };
  saveGmails();
  return groups[groupuuid];
};

const editGroup = (newName, newTags, id) => {
  groups[id].name = newName;
  groups[id].tags = newTags;
  saveGmails();
};

const deleteGroup = (id) => {
  delete groups[id];
  saveGmails();
};

const newGmail = async (email1, pass, proxy, recovery, security, group) => {
  const testv3OnAdd = false;
  if (!proxy) {
    let proxy = "localhost";
  }
  if (testv3OnAdd) {
    let gmail = {
      email: email1,
      password: pass,
      recovery: "",
      proxy: "",
      runs: 0,
      running: false,
      status: "Idle",
    };
    await test.testRecapV3(gmail.userdata, (score) => {
      gmail.v3 = score;
    });

    if (proxy !== "" || typeof proxy === "undefined") {
      gmail.proxy = proxy;
    } else {
      gmail.proxy = "localhost";
    }
    if (recovery) gmail.recovery = recovery;

    return gmail;
  } else {
    let gmail = {
      uuid: uuid.v4(),
      email: email1,
      password: pass,
      recovery: "",
      proxy: "",
      security: "",
      runs: 0,
      running: false,
      status: "Idle",
      score: {
        v3: "",
        v2i: "",
        v2v: "",
      },
      groupID: group,
    };

    if (proxy !== "") {
      gmail.proxy = proxy;
    } else {
      gmail.proxy = "localhost";
    }
    if (recovery !== undefined) gmail.recovery = recovery;
    if (security !== undefined) gmail.security = security;
    if (email1.substring(email1.length - 4) === "edu") {
      gmail.edu = true;
    } else {
      gmail.edu = false;
    }

    groups[group].gmails[gmail.uuid] = gmail;
    fs.writeFileSync(
      path.join(process.env.APPDATA, "purpl", "local-data", "gmails.json"),
      JSON.stringify(groups)
    );
    return gmail;
    //do this on close
  }
};

const importFromFile = (path) => {
  return new Promise((resolve, reject) => {
    if (path.split(".")[1] === "csv") {
      var newGroups = {};
      const imported = new Array();
      fs.createReadStream(path)
        .pipe(csv())
        .on("data", async (row) => {
          imported.push(row);
        })
        .on("end", async () => {
          for (const row of imported) {
            if (row.Category === "All") {
              newGmail(
                row.Username,
                row.Password,
                row.Proxy,
                row["Recovery Email"],
                row["Security Answer"],
                "default"
              );
            } else if (typeof newGroups[row.Category] === "undefined") {
              const newG = await addGroup(row["Category"], "Other");
              newGroups[row["Category"]] = {
                name: row["Category"],
                uuid: newG.uuid,
              };
              newGmail(
                row["Username"],
                row["Password"],
                row["Proxy"],
                row["Recovery Email"],
                row["Security Answer"],
                newG.uuid
              );
            } else if (typeof newGroups[row.Category] !== "undefined") {
              newGmail(
                row["Username"],
                row["Password"],
                row["Proxy"],
                row["Recovery Email"],
                row["Security Answer"],
                newGroups[row["Category"]].uuid
              );
            }
          }

          resolve(groups);
        });
    } else {
      const data = fs.readFileSync(path);
      var newGroups = {};
      JSON.parse(data.toString()).recaptchaList.data.forEach(async (gmail) => {
        if (
          typeof newGroups[gmail.groupName] === "undefined" &&
          gmail.groupName !== "All"
        ) {
          let newG = await addGroup(gmail.groupName, "Other");
          newGroups[newG.name] == newG;
          newGmail(
            gmail.account.account,
            gmail.account.password,
            gmail.farmingProxy.proxyID,
            gmail.account.recoveryEmail,
            gmail.account.secureAnswer,
            newG.uuid
          );
        } else if (gmail.groupName === "All") {
          newGmail(
            gmail.account.account,
            gmail.account.password,
            gmail.farmingProxy.proxyID,
            gmail.account.recoveryEmail,
            gmail.account.secureAnswer,
            "default"
          );
        } else if (typeof newGroups[gmail.groupName] !== "undefined") {
          newGmail(
            gmail.account.account,
            gmail.account.password,
            gmail.farmingProxy.proxyID,
            gmail.account.recoveryEmail,
            gmail.account.secureAnswer,
            newGroups[gmail.groupName].uuid
          );
        }
      });

      resolve(groups);
    }
  });
};

//need to change
const loadGmails = (fromfile, groupID) => {
  if (fromfile) {
    if (
      !fs.existsSync(
        path.join(process.env.APPDATA, "purpl", "local-data", "gmails.json")
      )
    )
      return undefined;
    console.log("file exists, reading", "info");
    let temp = fs.readFileSync(
      path.join(process.env.APPDATA, "purpl", "local-data", "gmails.json"),
      "utf8"
    );
    groups = temp !== "" ? JSON.parse(temp) : groups;
    return temp !== "" ? JSON.parse(temp) : undefined;
  } else {
    console.log(
      `[${new Date().toLocaleTimeString()}] - Loading Group ${groupID}`,
      "info"
    );
    return groups[groupID].gmails;
  }
};

const getGmail = (gmail, group) => {
  return groups[group].gmails[gmail];
};

const editGmail = (
  uuid,
  group,
  newGmail,
  newPass,
  newRecov,
  newSecurity,
  newProxy
) => {
  console.log(
    `[${new Date().toLocaleTimeString()}] - Editing gmail ${uuid}`,
    "info"
  );
  groups[group].gmails[uuid].email = newGmail;
  groups[group].gmails[uuid].password = newPass;
  groups[group].gmails[uuid].recovery = newRecov;
  groups[group].gmails[uuid].security = newSecurity;
  groups[group].gmails[uuid].proxy = newProxy;

  console.log(groups[group].gmails[uuid]);

  saveGmails();
};

const deleteGmail = (groupID, gmailID) => {
  if (groups[groupID].gmails[gmailID].running) {
    actionSpecific(gmailID, groupID);
  }
  delete groups[groupID].gmails[gmailID];
  saveGmails();
};

const getScores = (group, gmail) => {
  return groups[group].gmails[gmail].score;
};

const setScore = (group, gmail, type, score) => {
  groups[group].gmails[gmail].score[type] = score.toString();
};

//REWRITE THIS FUNCTION ASAP!!!!
const startAll = async (groupID) => {
  if (isMainThread) {
    for (const gmail in groups[groupID].gmails) {
      if (!groups[groupID].gmails[gmail].running) {
        await actionSpecific(gmail, groupID);
      }
    }

    saveGmails();
  }
};

const stopAll = async (groupID) => {
  if (isMainThread) {
    for (const gmail in groups[groupID].gmails) {
      if (groups[groupID].gmails[gmail].running) {
        await actionSpecific(gmail, groupID);
      }
    }

    saveGmails();
  }
};

var statuses = [];
const sendStatuses = async () => {
  const temp = statuses;
  statuses = [];
  return temp;
};

const saveCookies = (cookies, gmail, group) => {
  groups[group].gmails[gmail].cookies = cookies;
  saveGmails();
};

const actionSpecific = async (specificUuid, groupID) => {
  if (!groups[groupID].gmails[specificUuid].running) {
    console.log(
      `[${new Date().toLocaleTimeString()}] - Starting gmail ${specificUuid}`,
      "info"
    );

    //start gmail
    groups[groupID].gmails[specificUuid].running = true;
    //starts a specific gmail, method here to reduce clutter in task structure
    if (queueCheck()) {
      console.log(
        `[${new Date().toLocaleTimeString()}] - Gmail queued ${specificUuid}`,
        "info"
      );
      queued.push({
        uuid: specificUuid,
        groupID: groupID,
      });
      groups[groupID].gmails[specificUuid].status = "Queued";
      statuses.push({
        uuid: specificUuid,
        status: "Queued",
      });
      return "qd";
    } else {
      //sleepIn is how long until browser will be slept
      //returnIn is how long browser will be slept for

      const data = {
        gmail: groups[groupID].gmails[specificUuid],
        sleepIn:
          Date.now() +
          Math.floor(
            Math.random() *
              (runinputhigh * 60000 - runinputlow * 60000 + runinputlow * 60000)
          ),
        returnIn: Math.floor(
          Math.random() *
            (sleepinputhigh * 60000 -
              sleepinputlow * 60000 +
              sleepinputlow * 60000)
        ),
        manual: false,
      };
      const worker = new Worker(path.join(__dirname, "controller.js"), {
        workerData: data,
      });
      threads.add(worker);
      worker.on("message", (message) => {
        console.log(
          `[${new Date().toLocaleTimeString()}] - Received message ${JSON.stringify(
            message
          )}`
        );
        if (message.message.substring(0, 5) === "sleep") {
          sleepBrowser(worker.workerData.gmail.uuid);
        } else if (message.message === "stop") {
          console.log(
            `[${new Date().toLocaleTimeString()}] - Stopping worker ${
              message.id
            }`,
            "debug"
          );
          worker.terminate();
          statuses.push({
            uuid: message.id,
            status: "Idle",
          });
        } else if (message.cookie) {
          saveCookies(message.cookies, message.gmail, message.group);
        } else {
          groups[message.group].gmails[message.id].status = message.message;
          statuses.push({
            uuid: message.id,
            status: message.message,
            errors: message.errors,
          });

          //FOR THE TASK STATUSES ON UI
        }
      });
      worker.on("error", (err) => {
        console.log(
          `[${new Date().toLocaleTimeString()}] - Worker encountered error ${err}`,
          "error"
        );
        worker.terminate();
      });
      worker.on("exit", () => {
        threads.delete(worker);
        if (queued.length > 0) {
          pullFromQueue();
        }
        console.log(
          `[${new Date().toLocaleTimeString()}] - Worker deleted`,
          "info"
        );
      });
      saveGmails();
      return true;
    }
  } else {
    console.log(
      `[${new Date().toLocaleTimeString()}] - Stopping gmail ${specificUuid}`,
      "info"
    );
    //stop gmail
    groups[groupID].gmails[specificUuid].running = false;
    for (const worker of threads) {
      worker.postMessage({
        op: 2,
        uuid: specificUuid,
      });
    }
    saveGmails();
    return false;
  }
};
//2 = stop
//1 - manual login
const manualLogin = async (uuid, group) => {
  if (groups[group].gmails[uuid].running) {
    for (const worker of threads) {
      worker.postMessage({
        op: 1,
        uuid: uuid,
      });
    }
  } else {
    groups[group].gmails[uuid].running = true;
    const data = {
      gmail: groups[group].gmails[uuid],
      sleepIn:
        Date.now() +
        Math.floor(
          Math.random() *
            (runinputhigh * 60000 - runinputlow * 60000 + runinputlow * 60000)
        ),
      returnIn: Math.floor(
        Math.random() *
          (sleepinputhigh * 60000 -
            sleepinputlow * 60000 +
            sleepinputlow * 60000)
      ),
      manual: true,
    };
    const worker = new Worker(path.join(__dirname, "controller.js"), {
      workerData: data,
    });
    threads.add(worker);
    worker.on("message", (message) => {
      console.log(
        `[${new Date().toLocaleTimeString()}] - Received message ${message}`,
        "info"
      );
      if (message.message.substring(0, 5) === "sleep") {
        sleepBrowser(worker.workerData.gmail.uuid);
      } else if (message.message === "stop") {
        console.log(
          `[${new Date().toLocaleTimeString()}] - Stopping worker ${
            message.id
          }`,
          "info"
        );
        worker.terminate();
        statuses.push({
          uuid: message.id,
          status: "Idle",
        });
      } else if (message.cookie) {
        saveCookies(message.cookies, message.gmail, message.group);
      } else {
        groups[message.group].gmails[message.id].status = message.message;
        statuses.push({
          uuid: message.id,
          status: message.message,
        });

        //FOR THE TASK STATUSES ON UI
      }
    });
    worker.on("error", (err) => {
      console.log(
        `[${new Date().toLocaleTimeString()}] - Worker encountered error ${err}`,
        "error"
      );
      worker.terminate();
    });
    worker.on("exit", () => {
      threads.delete(worker);
      if (queued.length > 0) {
        pullFromQueue();
      }
      console.log(
        `[${new Date().toLocaleTimeString()}] - Worker deleted`,
        info
      );
    });
  }

  saveGmails();
};

const testGmail = async (uuid, group, type) => {
  console.log(
    `[${new Date().toLocaleTimeString()}] - Testing ${uuid}`,
    "debug"
  );
  if (groups[group].gmails[uuid].running) {
    actionSpecific(uuid, group);
  }
  test.testGmail(uuid, group, type).then((rawresult) => {
    const parsedResult = JSON.parse(rawresult);
    console.log(
      `[${new Date().toLocaleTimeString()}] - Got result ${parsedResult}`,
      "debug"
    );
    if (type === "v2v") {
      groups[group].gmails[uuid].score.v2v = parsedResult.score;
    } else if (type === "v2i") {
      groups[group].gmails[uuid].score.v2i = parsedResult.score;
    } else if (type === "v3") {
      groups[group].gmails[uuid].score.v3 = parsedResult.score;
    }

    saveGmails();
    return result;
  });
};

//FIX THIS, FIND IF YOU CAN ACCESS WORKERDATA FROM OUTSIDE WORKER CONTEXT
const sleepBrowser = (uuid, groupID, worker) => {
  if (queued.length > 0) {
    pullFromQueue();
  }

  worker.terminate();
  queued.push({
    uuid: uuid,
    groupID: groupID,
  });
};

const queueCheck = () => {
  //check to see if there is already max number of browsers running, if so it returns true to queue the browser
  console.log(`[${new Date().toLocaleTimeString()}] - Checking q`, "info");
  if (threads.size >= maxRunning) {
    console.log(`[${new Date().toLocaleTimeString()}] - Gmail queued`, "info");
    return true;
  } else {
    console.log(`[${new Date().toLocaleTimeString()}] - No queue`, "info");
    return false;
  }
};

const pullFromQueue = () => {
  console.log(
    `[${new Date().toLocaleTimeString()}] - Pulling gmail from q`,
    "info"
  );
  const unqueued = queued.shift();
  actionSpecific(unqueued.uuid, unqueued.groupID);
};

//REWRITE THIS!!!
const exportGmails = () => {
  let base = "EMAIL,PASSWORD,RECOVERY EMAIL,PROXY\n";
  for (const gmail in groups) {
    base += `${gmail.email},${gmail.password},${gmail.recovery},${gmail.proxy}\n`;
  }
  let dateob = new Date();
  fs.writeFileSync(
    path.join(
      process.env.APPDATA,
      "purpl",
      "exports",
      "gmails",
      `gmails (${dateob.getFullYear()}-${("0" + (dateob.getMonth() + 1)).slice(
        -2
      )}-${("0" + dateob.getDate()).slice(-2)}).csv`
    ),
    base
  );

  require("child_process").exec(
    `start "" "${path.join(
      process.env.APPDATA,
      "purpl",
      "local-data",
      "exports",
      "gmails"
    )}"`
  );
};

const saveGmails = () => {
  return new Promise((resolve, reject) => {
    Object.values(groups).forEach((group) => {
      Object.values(group.gmails).forEach((gmail) => {
        gmail.running = false;
        gmail.status = "Idle";
      });
    });
    fs.writeFile(
      path.join(process.env.APPDATA, "purpl", "local-data", "gmails.json"),
      JSON.stringify(groups),
      function (err) {
        if (err) console.log(error, "error");
        resolve();
      }
    );
  });
};

module.exports = {
  sleepBrowser: sleepBrowser,
  loadGmails: loadGmails,
  newGmail: newGmail,
  actionSpecific: actionSpecific,
  addGroup: addGroup,
  startAll: startAll,
  stopAll: stopAll,
  editGroup: editGroup,
  deleteGroup: deleteGroup,
  saveGmails: saveGmails,
  getGmail: getGmail,
  editGmail: editGmail,
  deleteGmail: deleteGmail,
  manualLogin,
  manualLogin,
  testGmail: testGmail,
  getScores: getScores,
  setScore: setScore,
  importFromFile: importFromFile,
  copy: copy,
  sendStatuses,
};
