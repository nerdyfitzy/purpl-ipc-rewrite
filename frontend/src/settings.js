const { ipcRenderer } = require("electron");

$("#settings-submit").on("click", () => {
  ipcRenderer.send("save-settings", {
    webhook: $("#webhook").val(),
    chrome: $("#chrome-path").val(),
    gmailToken: $("#gmail-token").val(),
    twoCap: $("#2cap").val(),
    fiveSim: $("#5sim").val(),
  });
});

$(document).ready(() => {
  const { global, misc } = ipcRenderer.sendSync("get-settings");
  $("#webhook").val(global.webhook);
  $("#chrome-path").val(global.chromePath);
  $("#gmail-token").val(misc.gmailToken);
  $("#2cap").val(misc.twoCaptcha);
  $("#5sim").val(misc.fivesim);
});
