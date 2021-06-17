//file holding functions to test recap
const { Worker, isMainThread, parentPort } = require("worker_threads");

const path = require("path");
const farmer = require("../tasks");

const threads = new Set();
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
      const worker = new Worker(path.join(__dirname, "test_controller.js"), {
        workerData: data,
      });
      threads.add(worker);
      worker.on("message", (message) => {
        console.log(message, "debug");
        worker.terminate();
        resolve(JSON.stringify(message));
      });
      worker.on("exit", () => {
        threads.delete(worker);
        pullFromQ();
      });
      worker.on("error", (err) => {
        console.log(err, "error");
        worker.terminate();
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
