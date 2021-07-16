const { ipcRenderer, remote, ipcMain } = require("electron");
const path = require("path");
const $ = require("jquery");
const tableBody = $("table tbody");
let cmOpen = false;
let currentgroup = "default";
const Mousetrap = require("mousetrap");

Mousetrap.bind("ctrl+a", () => {
  for (const el of $("body #profileIsChecked")) {
    $(el).addClass("opc-1");
    $("#selected-num").text($("body #profileIsChecked").length.toString());
  }
});

Mousetrap.bind("ctrl+q", () => {
  for (const el of $("body #profileIsChecked")) {
    $(el).removeClass("opc-1");
    $("#selected-num").text("0");
  }
});

$("body").on("click", function () {
  showCM(false);
});

function showCM(show) {
  if (show) {
    console.log("opening");
    cmOpen = true;
    $(".custom-cm").css("display", "block");
  } else {
    console.log("closing");
    cmOpen = false;
    $(".custom-cm").css("display", "none");
  }
}

$("#search-import").on("keyup", function () {
  var filter = $(this).val().toLowerCase();
  $("#bots .col-6").each(function () {
    console.log($(this));
    $(this).toggle(
      $(this).find("div").attr("id").toLowerCase().indexOf(filter) > -1
    );
  });
  if (!filter) {
    $("#bots div").filter(function () {
      $(this).toggle(true);
    });
  }
});
$("#export-search").on("keyup", function () {
  var filter = $(this).val().toLowerCase();
  $("#bots-export .col-6").each(function () {
    console.log($(this));
    $(this).toggle(
      $(this).find("div").attr("id").toLowerCase().indexOf(filter) > -1
    );
  });
  if (!filter) {
    $("#bots div").filter(function () {
      $(this).toggle(true);
    });
  }
});
$("#prof-search").on("keyup", function () {
  console.log("keyup");
  var filter = $(this).val().toLowerCase();
  $("#profile-add .account-card").each(function () {
    console.log($(this));
    $(this).toggle(
      $(this).find(".f-14").text().toLowerCase().indexOf(filter) > -1
    );
  });
  if (!filter) {
    $("#bots div").filter(function () {
      $(this).toggle(true);
    });
  }
});

$("#delete-all-current").on("click", async () => {
  ipcRenderer.send("delete-all-profiles", currentgroup);
  $("#profile-add").empty();
});
//f you github

let lastclicked;
const addProfile = (profile) => {
  $("#profile-add").append(`
    <div class="account-card  text-white" style="padding: 10px 13px;" id="${
      profile.uuid
    }">
        <div class="d-flex align-items-center justify-content-between" id="${
          profile.uuid
        }">
            <span class="position-relative"><img src="../assets/images/user-card.png" alt=""> <i  class="checked-card fas fa-check" id="profileIsChecked"></i></span>
            <div class="d-flex align-items-center justify-content-between" id="${
              profile.uuid
            }">
                <button  data-bs-toggle="modal" data-bs-target="#editModal"  style="margin-right: 5px;" class="border-0 p-0  edit-ic  icon-btn" id="${
                  profile.uuid
                }_edit"></button>
                <button class="border-0 p-0  delete-ic  icon-btn" id="${
                  profile.uuid
                }_delete"></button>
            </div>
        </div>
        <div class="f-14 mt-2" id="${profile.uuid}">
            ${profile.profile_name}
        </div>
        <div class="f-14 mt-2" id="${profile.uuid}">
            <img src="../assets/images/credit-card-c.png" alt=""> <span class="ms-2 f-10">**** **** **** ${profile.payment.cnb.substring(
              profile.payment.cnb.length - 4
            )}</span>
        </div>
        <div class="f-14 mt-2" id="${profile.uuid}">
            <img src="../assets/images/mail.png" alt=""> <span class="ms-2 f-10">${
              profile.email
            }</span>
        </div>
    
    </div>
    </div> `);
  let ct = parseInt($("#profile-count").text());
  $("#profile-count").text(++ct);
  $(`#${profile.uuid}_edit`).on("click", () => {});

  $(`#${profile.uuid}_delete`).on("click", async (event) => {
    ipcRenderer.send("delete-profile", {
      uuid: profile.uuid,
      group: currentgroup,
    });
    let ct = parseInt($("#profile-count").text());
    ct--;
    $("#profile-count").text(ct);
    $(`#${currentgroup}-num`).text(ct + " Profiles");
    $(`#${event.target.getAttribute("id").split("_")[0]}`).remove();
  });

  $(`#${profile.uuid}`).on("contextmenu", (event) => {
    showCM(true);
    $(".custom-cm").css("top", event.pageY);
    $(".custom-cm").css("left", event.pageX);
  });

  $(`#${profile.uuid}`).on("click", function (e) {
    let inRange = false;
    console.log($(this).find("#profileIsChecked"));
    if (e.shiftKey) {
      var flag = false;
      document.querySelectorAll(".account-card").forEach((card) => {
        if (card === lastclicked) {
          console.log("this is last clicked", card);
          flag = true;
        }
        if (flag) {
          console.log("flag true, added", card);
          $(card).find("#profileIsChecked").addClass("opc-1");
        }
        if (card === this) {
          console.log("found last", card);
          $(card).find("#profileIsChecked").addClass("opc-1");
          flag = false;
        }
      });
    }
    console.log("set last clicked", this);
    lastclicked = this;
  });
};

$("#move-sel").on("click", async () => {
  const groups = ipcRenderer.sendSync("get-profiles", {
    initial: true,
    group: undefined,
  });
  for (const group in groups) {
    $("#move-group").append(
      `<option value="${group}">${groups[group].name}</option>`
    );
  }
});

$("#move-group-submit").on("click", async () => {
  let sel = new Array();
  let all = $("body #profileIsChecked");
  for (const el of all) {
    if ($(el).hasClass("opc-1")) {
      await sel.push($(el).parent().parent().attr("id"));
      $(`#${$(el).parent().parent().attr("id")}`).remove();
      console.log($(el).parent());
    }
  }
  ipcRenderer.send("move-profiles", {
    toGroup: $("#move-group").val(),
    fromGroup: currentgroup,
    uuids: sel,
  });
  $("#move-group").empty();
});

$("#copy-sel").on("click", async () => {
  let sel = new Array();
  let all = $("body #profileIsChecked");
  for (const el of all) {
    if ($(el).hasClass("opc-1")) {
      await sel.push($(el).parent().parent().attr("id"));
      console.log($(el).parent());
    }
  }
  if (sel.length !== 0) {
    const newProfiles = ipcRenderer.sendSync("copy-profiles", {
      uuids: sel,
      group: currentgroup,
    });
    for (const profile of newProfiles) {
      addProfile(profile);
    }
  }
});

$("#jig-submit").on("click", async () => {
  let sel = new Array();
  let all = $("body #profileIsChecked");
  for (const el of all) {
    if ($(el).hasClass("opc-1")) {
      await sel.push($(el).parent().parent().attr("id"));
      console.log($(el).parent());
    }
  }
  console.log(sel);
  if (sel.length > 0) {
    const jigged = ipcRenderer.sendSync("jig-profiles", {
      profilesToJig: {
        uuids: sel,
        group: currentgroup,
      },
      options: {
        RANDOM_LETTERS: {
          checked: $("#4-lett").prop("checked"),
          amount: parseInt($("#amt-letters").val()),
          position: $("#letters-position").val(),
        },
        RANDOM_APT: {
          checked: $("#apt-jig").prop("checked"),
          position: $("#apt-line-choose").val(),
        },
        RANDOM_FNAME: $("#ran-fname").prop("checked"),
        RANDOM_LNAME: $("#ran-lname").prop("checked"),
        RANDOM_PHONE: $("#ran-phone").prop("checked"),
      },
    });
    const original = parseInt($("#profile-count").html());
    $("#profile-count").html(original - sel.length);
    $("#profile-add").empty();
    console.log(jigged);
    Object.values(jigged.profiles).forEach((profile) => {
      addProfile(profile);
    });
  }
});

$("#del-sel").on("click", async () => {
  let sel = new Array();
  let all = $("body #profileIsChecked");
  for (const el of all) {
    if ($(el).hasClass("opc-1")) {
      await sel.push($(el).parent().parent().attr("id"));
      console.log($(el).parent());
    }
  }
  if (sel.length !== 0) {
    ipcRenderer.send("delete-sel-profiles", {
      uuids: sel,
      group: currentgroup,
    });
    for (const uuid of sel) {
      $(`#${uuid}`).remove();
    }
  }
});

const addGroupToList = (group) => {
  $("#task-groups-add").append(`<div class="side-card text-white" id="${
    group.uuid
  }">
            <div class="d-flex align-items-center justify-content-between" id="${
              group.uuid
            }">
                <span>${group.name}</span>
                <div class="d-flex align-items-center justify-content-between" id="${
                  group.uuid
                }">
                    <button  style="margin-right: 5px;" class="border-0 p-0  edit-ic  icon-btn" id="${
                      group.uuid
                    }_edit"></button>
                    <button class="border-0 p-0  delete-ic  icon-btn" id="${
                      group.uuid
                    }_delete"></button>

                </div>
            </div>
            <div class="controls d-flex align-items-center " id="${group.uuid}">
                <span class="d-inline-flex align-items-center" style="font-size: 12px;" id="${
                  group.uuid
                }">
                    <img style="margin: -2px 5px 0 0;" src="../assets/images/profile-account.png" alt=""> <span id=${
                      group.uuid
                    }-num>${
    Object.values(group.profiles).length
  } <small class="ms-1">Profiles</small></span></span>
            </div>
        </div>`);

  $(`#${group.uuid}`).on("click", async (event) => {
    console.log(event);
    if (event.target.getAttribute("id").includes("edit")) {
      console.log("edit");
    } else if (event.target.getAttribute("id").includes("delete")) {
      console.log(
        "delete da group",
        event.target.getAttribute("id").split("_")[0]
      );
      ipcRenderer.send("delete-profile-group", {
        group: event.target.getAttribute("id").split("_")[0],
      });
      $(`#${event.target.getAttribute("id").split("_")[0]}`).remove();
    } else if (event.target.getAttribute("id") !== currentgroup) {
      $(`#${currentgroup}`).css("border", "");
      $(`#${event.target.getAttribute("id")}`).css(
        "border",
        "1px solid #733fcc"
      );

      currentgroup = event.target.getAttribute("id");
      //gets gmails in a certain group from backend
      const parsed = ipcRenderer.sendSync("get-profiles", {
        group:
          event.target.getAttribute("id").includes("name") ||
          event.target.getAttribute("id").includes("tags")
            ? event.target.getAttribute("id").split("_")[0]
            : event.target.getAttribute("id"),
        initial: false,
      });
      $("#profile-add").empty();
      console.log("parsed");
      $("#profile-count").text(0);
      $("#selected-num").text(0);
      Object.values(parsed.profiles).forEach((profile) => {
        addProfile(profile);
      });
    }
  });

  $(`#${group.uuid}_delete`).on("click", async () => {
    console.log("del", group.uuid);
    ipcRenderer.send("delete-profile-group", group.uuid);
    $(`#${group.uuid}`).remove();
  });

  $(`#${group.uuid}_edit`).on("click", () => {
    jQuery("#groupEditModal").modal("show");
    ipcRenderer.send("edit-profile-group", {
      uuid: group.uuid,
      name: $("#group-name-edit").val(),
    });
  });
};

const newProf = async () => {
  console.log("new profile submit");
  let cur = parseInt($(`#${currentgroup}-num`).text());
  $(`#${currentgroup}-num`).text(++cur);
  var profile = {
    profile_name: document.getElementById("profname-input").value,
    email: document.getElementById("email-input").value,
    group: currentgroup,
    one_checkout: false,
    shipping: {
      name:
        document.getElementById("fname-input").value +
        " " +
        document.getElementById("lname-input").value,
      phone: document.getElementById("phone-input").value,
      addy1: document.getElementById("ship1-input").value,
      addy2: document.getElementById("ship2-input").value,
      zip: document.getElementById("zip-input").value,
      city: document.getElementById("city-input").value,
      state: document.getElementById("state-input").value,
      country: document.getElementById("country-input").value,
    },
    sameBilling: document.getElementById("same-bill").checked,
    billing: document.getElementById("same-bill").checked
      ? {
          name:
            document.getElementById("fname-input").value +
            " " +
            document.getElementById("lname-input").value,
          phone: document.getElementById("phone-input").value,
          addy1: document.getElementById("ship1-input").value,
          addy2: document.getElementById("ship2-input").value,
          zip: document.getElementById("zip-input").value,
          city: document.getElementById("city-input").value,
          state: document.getElementById("state-input").value,
          country: document.getElementById("country-input").value,
        }
      : {
          name:
            document.getElementById("bill-fname-input").value +
            " " +
            document.getElementById("bill-lname-input").value,
          phone: document.getElementById("phone-b-input").value,
          addy1: document.getElementById("bill-ship1-input").value,
          addy2: document.getElementById("bill-ship2-input").value,
          zip: document.getElementById("bill-zip-input").value,
          city: document.getElementById("bill-city-input").value,
          state: document.getElementById("bill-state-input").value,
          country: document.getElementById("bill-country-input").value,
        },
    payment: {
      name: document.getElementById("pay-name-input").value,
      type: document.getElementById("card-type-input").value,
      month: document.getElementById("pay-expm-input").value,
      year: document.getElementById("pay-expy-input").value,
      cnb: document.getElementById("pay-cnb-input").value,
      cvv: document.getElementById("pay-cvv-input").value,
    },
  };
  profile.uuid = ipcRenderer.sendSync("new-profile", {
    group: currentgroup,
    profile,
  });
  addProfile(profile);
  document.getElementById("pay-name-input").value = "";
  document.getElementById("card-type-input").value = "";
  document.getElementById("pay-expm-input").value = "";
  document.getElementById("pay-expy-input").value = "";
  document.getElementById("pay-cnb-input").value = "";
  document.getElementById("pay-cvv-input").value = "";

  document.getElementById("bill-fname-input").value = "";
  document.getElementById("bill-lname-input").value = "";
  document.getElementById("phone-b-input").value = "";
  document.getElementById("bill-ship1-input").value = "";
  document.getElementById("bill-ship2-input").value = "";
  document.getElementById("bill-zip-input").value = "";
  document.getElementById("bill-city-input").value = "";
  document.getElementById("bill-state-input").value = "";
  document.getElementById("bill-country-input").value = "";

  document.getElementById("fname-input").value = "";
  document.getElementById("lname-input").value = "";
  document.getElementById("phone-input").value = "";
  document.getElementById("ship1-input").value = "";
  document.getElementById("ship2-input").value = "";
  document.getElementById("zip-input").value = "";
  document.getElementById("city-input").value = "";
  document.getElementById("state-input").value = "";
  document.getElementById("country-input").value = "";

  document.getElementById("profname-input").value = "";
  document.getElementById("email-input").value = "";
};

$("#new-profile-submit").on("click", async () => {
  newProf();
});

$("#new-profile-submit-pay").on("click", () => {
  newProf();
});

$("#new-profile-submit-bill").on("click", () => {
  newProf();
});

$("#new-group-submit").on("click", async () => {
  const newGp = ipcRenderer.sendSync(
    "new-profile-group",
    document.getElementById("group-name-input").value
  );

  addGroupToList(newGp);
});

var bot;
$("#bots .col-6 .im-ex-icons").each(function () {
  var icon = $(this);
  console.log(icon, "icon");
  icon.on("click", () => {
    $("#bots .col-6 .im-ex-icons").each(function () {
      $(this).removeClass("selected");
      $(this).css("border", "");
    });
    console.log(this, "clicked");
    $(this).addClass("selected");
    $(this).css("border", "1px solid #733fcc");
    bot = this.getAttribute("id");
    $("#import-file-btn").text(`Import ${this.getAttribute("id")} File`);
  });
});
var export_bot;
$("#bots-export .col-6 .im-ex-icons").each(function () {
  var icon = $(this);
  icon.on("click", () => {
    $("#bots .col-6 .im-ex-icons").each(function () {
      $(this).removeClass("selected");
      $(this).css("border", "");
    });
    $(this).addClass("selected");
    $(this).css("border", "1px solid #733fcc");
    export_bot = this.getAttribute("id");
  });
});

$("#export-button").on("click", async () => {
  let sel = new Array();
  let all = $("body #profileIsChecked");
  for (const el of all) {
    if ($(el).hasClass("opc-1")) {
      await sel.push($(el).parent().parent().attr("id"));
      console.log($(el).parent());
    }
  }
  console.log(sel, "sel");
  ipcRenderer.send("export-profiles", {
    profs: sel.length === 0 ? null : sel, //array of uuids selected
    group: currentgroup,
    bot: export_bot,
  });
});

ipcRenderer.on("profiles-import", async (event, path, bot) => {
  const imported = ipcRenderer.sendSync("import-profiles", { path, bot });
  console.log(imported);
  if (typeof imported !== "undefined") {
    addGroupToList(imported);
  }
});

$("#file-input").on("click", async function () {
  var input = $(this);
  ipcRenderer.send("open-file-dialog", ["profiles", bot]);
  $("#bots .col-6 .im-ex-icons").each(async (index) => {
    $(this).removeClass("selected");
  });
});

$("#default").on("click", async (event) => {
  if (currentgroup !== "default") {
    console.log(currentgroup);
    $("#default").css("border", "1px solid #733fcc");
    $("#profile-count").text(0);
    $("#selected-num").text(0);
    $(`#${currentgroup}`).css("border", "");
    currentgroup = "default";
    const parsed = ipcRenderer.sendSync("get-profiles", {
      initial: false,
      group: "default",
    });

    $("#profile-add").empty();
    console.log(parsed);
    Object.values(parsed.profiles).forEach((profile) => {
      addProfile(profile);
    });
  }
});

var asd = setInterval(() => {
  if (!$("#accountModal").is(":visible")) {
    console.log("empything");
    $("#proxies-acc-input").empty();
  }
}, 3000);

$("#accounts-modal-open").on("click", () => {
  console.log("opened");
  const parsedProxies = ipcRenderer.sendSync("get-proxies", {
    initial: false,
    group: undefined,
  });
  console.log(parsedProxies);
  Object.values(parsedProxies).forEach((group) => {
    $("#proxies-acc-input").append(
      `<option value="${group.uuid}" id="${group.uuid}">${group.name}</option>`
    );
  });
});

$("#vcc-modal-open").on("click", () => {
  const parsedProfiles = ipcRenderer.sendSync("get-profiles", {
    initial: true,
    group: undefined,
  });
  console.log(parsedProfiles);
  if (parsedProfiles["default"].profiles !== {}) {
    Object.values(parsedProfiles["default"].profiles).forEach((profile) => {
      $("#profile-base").append(
        `<option value="${profile.uuid}" id="${profile.uuid}">${profile.profile_name}</option>`
      );
    });
  }
  Object.values(parsedProfiles).forEach((group) => {
    $("#profile-group-base").append(
      `<option value="${group.uuid}" id="${group.uuid}">${group.name}</option>`
    );
  });
  $("#profile-group-base").on("change", () => {
    console.log("base change");
    $("#profile-base").empty();
    Object.values(
      parsedProfiles[$("#profile-group-base").val()].profiles
    ).forEach((profile) => {
      $("#profile-base").append(
        `<option value="${profile.uuid}" id="${profile.uuid}">${profile.profile_name}</option>`
      );
    });
  });
});

$("#vcc-submit").on("click", () => {
  ipcRenderer.send("vcc-actions", {
    service: $("#vcc-service-choose").val(),
    action: $("#action-choose").val(),
    qty:
      $("#action-choose").val() === "make"
        ? parseInt($("#cards-qty").val())
        : false,
    names:
      $("#action-choose").val() === "make" ? $("#cards-name").val() : false,
    profileInfo: {
      group: $("#profile-group-base").val(),
      profile: $("#profile-base").val(),
    },
  });
});

ipcRenderer.on("vcc-actions-reply", (event, profiles) => {
  addGroupToList(profiles);
});

$("#site-choose").on("change", () => {
  console.log($("#proxies-acc-input"), "haha");
  $("#site-header").text(`on ${$("#site-choose").val()}`);

  if ($("#site-choose").val() === "Amazon") {
    $("#proxies-input").empty();
    $("#prof-group").append(`<label for="profile-group-choose"
        >Profile Group</label
      >
      <select
        name="profile-group-choose"
        id="profile-group-choose"
      ></select>`);
    $("#spec-prof").append(`<label for="spec-prof-choose"
      >Specific Profile</label
    >
    <select
      name="spec-prof-choose"
      id="spec-prof-choose"
    ></select>`);
    $(".account-box").css("height", "610px");

    const groups = ipcRenderer.sendSync("get-profiles", {
      initial: true,
      group: undefined,
    });
    $("#profile-group-choose").on("change", () => {
      $("#spec-prof-choose").empty();
      Object.values(groups[$("#profile-group-choose").val()].profiles).forEach(
        (profile) => {
          $("#spec-prof-choose").append(
            `<option value="${profile.uuid}" id="${profile.uuid}_accounts">${profile.profile_name}</option>`
          );
        }
      );
    });
    Object.values(groups).forEach((group) => {
      $("#profile-group-choose").append(
        `<option value="${group.uuid}" id="${group.uuid}_accounts">${group.name}</option>`
      );
      // $(`#${group.uuid}_accounts`).on("click", () => {
      //   console.log("click");
      //   $("#spec-prof-choose").empty();
      //   Object.values(groups[group.uuid].profiles).forEach((profile) => {
      //     console.log(profile);
      //     $("#spec-prof-choose").append(
      //       `<option value="${profile.uuid}" id="${profile.uuid}_accounts">${profile.profile_name}</option>`
      //     );
      //   });
      // });
    });
    Object.values(groups.default.profiles).forEach((profile) => {
      $("#spec-prof-choose").append(
        `<option value="${profile.uuid}" id="${profile.uuid}">${profile.profile_name}</option>`
      );
    });
  } else if ($("#proxies-acc-input").length === 0) {
    console.log("deleting");
    $("#prof-group").empty();
    $("#spec-prof").empty();
    $("#proxies-input").append(`<label for="proxies-acc-input"
        >Proxies To Use</label
      >
      <select
        name="proxies-acc-input"
        id="proxies-acc-input"
      ></select>`);

    $(".account-box").css("height", "500px");
  }
});

$("#create-accs").on("click", () => {
  ipcRenderer.send("create-accounts", {
    site: $("#site-choose").val(),
    catchall: "@" + $("#catchall-input").val(),
    qty: parseInt($("#qty-acc-input").val()),
    proxyList: $("#proxies-acc-input").val(),
    profileId:
      $("#spec-prof-choose").length > 0
        ? $("#spec-prof-choose").val()
        : undefined,
    groupId:
      $("#profile-group-choose").length > 0
        ? $("#profile-group-choose").val()
        : undefined,
  });
});

const start = async () => {
  const parsedInit = ipcRenderer.sendSync("get-profiles", {
    initial: true,
    group: undefined,
  });

  console.log(parsedInit);
  if (Object.values(parsedInit).length > 1) {
    Object.values(parsedInit).forEach(async (group) => {
      if (group.uuid !== "default") {
        addGroupToList(group);
      }
    });
  }
  $("#default").css("border", "1px solid #733fcc");
  if (Object.values(parsedInit.default.profiles).length > 0) {
    $("#profile-count").text(Object.values(parsedInit.default.profiles).length);
    $("#default-num").text(Object.values(parsedInit.default.profiles).length);
    Object.values(parsedInit.default.profiles).forEach((profile) => {
      addProfile(profile);
    });
  }
};

start();

$("#close-button").on("click", async function () {
  const win = remote.getCurrentWindow();
  win.close();
});

$("#minimize-button").on("click", async function () {
  const win = remote.getCurrentWindow();
  win.minimize();
});
