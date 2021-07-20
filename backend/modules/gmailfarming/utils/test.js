//file holding functions to test recap
const { spawn } = require("child_process");

const path = require("path");
const farmer = require("../tasks");

const threads = new Set();
let runningTasks = {};
const queued = new Array();

const maxRunning = 10;

const console = require("../../../utils/logger");

const testGmail = async (uuid, group, type) => {
  return new Promise(async (resolve, reject) => {
    //type =
    //'v3'
    //'v2v'
    //'v2i'
    const queuecheck = await checkQ();
    if (!queuecheck) {
      const gmail = await farmer.getGmail(uuid, group);
      const data = {
        uuid: gmail.uuid,
        gmail: gmail.email,
        pass: gmail.password,
        proxy: gmail.proxy,
        recovery: gmail.recovery,
        security: gmail.security,
        type: type,
        group: gmail.groupID,
      };
      console.log(data, "debug");
      const child = spawn("node", [
        path.join(__dirname, "test_controller.js"),
        JSON.stringify(data),
      ]);
      runningTasks[uuid] = child;

      child.stdout.on("data", (data) => {
        console.log(message, "debug");
        try {
          const dParse = JSON.parse(data.toString());
          runningTasks[dParse.uuid].kill();
          delete runningTasks[dParse.uuid];
          pullFromQ();
          resolve(message.toString());
        } catch (e) {
          console.log(e, "error");
        }
      });
      child.on("close", (code) => {
        pullFromQ();
        delete runningTasks[uuid];
      });
      child.stderr.on("data", (data) => {
        console.log(data, "error");
        runningTasks[uuid].kill();
        delete runningTasks[uuid];
        pullFromQ();
      });
    } else {
      console.log("queueing", "info");
      queued.push({
        uuid: uuid,
        group: group,
        type: type,
      });
    }
  });
};

const pullFromQ = () => {
  if (queued.length > 0) {
    const pulled = queued.shift();
    testGmail(pulled.uuid, pulled.group, pulled.type);
  }
};

const checkQ = () => {
  if (threads.size >= maxRunning) {
    console.log("queued.", "info");
    return true;
  } else {
    console.log("good to go!", "info");
    return false;
  }
};

module.exports = {
  testGmail: testGmail,
};
