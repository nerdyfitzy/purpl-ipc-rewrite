const { ipcRenderer, remote } = require("electron");
const path = require("path");
const $ = require("jquery");

$("#login-button").on("click", async () => {
  console.log("login attempt!");
  console.log(document.getElementById("license-key-input-box").value);
  if (true) {
    const activated = ipcRenderer.sendSync(
      "activate",
      document.getElementById("license-key-input-box").value
    );
    if (activated.success === 1) {
      ipcRenderer.send("to-dashboard-page", "key");
    } else {
      console.log("Invalid Key!");
      $("#login-error").html(activated.reason);
    }
  } else {
    ipcRenderer.send("to-dashboard-page", "key");
  }
});

$("#close-button").on("click", async function () {
  const win = remote.getCurrentWindow();
  win.close();
});

$("#minimize-button").on("click", async function () {
  const win = remote.getCurrentWindow();
  win.minimize();
});
