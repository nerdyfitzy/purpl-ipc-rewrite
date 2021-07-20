const util = require("util");
const path = require("path");
const { spawn } = require("child_process");

const child = spawn("node", [
  path.join(__dirname, "execThis.js"),
  "gmail.com",
  "password",
  "-m",
]);

child.stdout.on("data", (data) => {
  console.log("got it ", JSON.parse(data.toString()));

  child.kill();
});

// (async () => {
//   const { stdout, stderr } = await execFile("node", [
//     `"c:\\Users\\steph\\Documents\\GitHub\\purpl-ipc-rewrite\\testing\\execThis.js"`,
//   ]);
//   console.log(stdout);
//   stdout.on("data", (data) => {
//     console.log(data);
//   });
// })();

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
