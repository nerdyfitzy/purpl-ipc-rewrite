const { ipcRenderer, remote } = require("electron");
const $ = require("jquery");
const tableBody = $("table tbody");
let cmOpen = false;
let currentgroup = "default";

$("#selectAll").on("click", function () {
  $("input:checkbox").not(this).prop("checked", this.checked);
});

var asd = setInterval(() => {
  if (!$("#exampleModal").is(":visible")) {
    console.log("empything");
    $("#proxy-group-input").empty();
    $("#spec-proxy-input").empty();
  }
}, 3000);
$("body").on("click", function () {
  showCM(false);
});

const changeStartNum = (group, plus) => {
  let num = parseInt($(`#${group}-start-number`).text());
  if (plus) {
    console.log("adding to start", num);
    num++;
    console.log("added", num);
    $(`#${group}-start-number`).text(`${num}`);
  } else {
    console.log("minusing to start", num);
    num--;
    $(`#${group}-start-number`).text(`${num}`);
  }
};

const changeStopNum = (group, plus) => {
  let num = parseInt($(`#${group}-stop-number`).text());
  if (plus) {
    console.log("adding to stop", num);
    ++num;
    $(`#${group}-stop-number`).text(num);
  } else {
    console.log("minusing to stop", num);
    --num;
    $(`#${group}-stop-number`).text(num);
  }
};

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

$("#start-sel").on("click", async function () {
  const checked = $("input:checkbox:checked");
  console.log(checked);
  for (const box of checked) {
    if (box.getAttribute("id") !== "selectAll") {
      console.log(box);
      //action-specific
      ipcRenderer.send("action-specific", {
        gmail: box.getAttribute("id").split("_")[0],
        group: currentgroup,
      });
    }
  }
});

$("#stop-sel").on("click", async function () {
  const checked = $("input:checkbox:checked");
  console.log(checked);
  for (const box of checked) {
    if (box.getAttribute("id") !== "selectAll") {
      console.log(box);
      //action-specific
      ipcRenderer.send("action-specific", {
        gmail: box.getAttribute("id").split("_")[0],
        group: currentgroup,
      });
    }
  }
});

//////////////////////////////////////////////
//////////////////////////////////////////////
///
// C O P Y    F U N C T I O N S
//
//////////////////////////////////////////////
//////////////////////////////////////////////
$("#copy-email").on("click", async () => {
  const checked = $("input:checkbox:checked");
  console.log(checked);
  for (const box of checked) {
    if (box.getAttribute("id") !== "selectAll") {
      console.log(box);
      //copy-data
      ipcRenderer.send("copy-data", {
        group: currentgroup,
        uuid: box.getAttribute("id").split("_")[0],
        data: "email",
      });
    }
  }
});

$("#copy-password").on("click", async () => {
  const checked = $("input:checkbox:checked");
  console.log(checked);
  for (const box of checked) {
    if (box.getAttribute("id") !== "selectAll") {
      console.log(box);
      ipcRenderer.send("copy-data", {
        grou: currentgroup,
        uuid: box.getAttribute("id").split("_")[0],
        data: "password",
      });
    }
  }
});

$("#copy-proxy").on("click", async () => {
  const checked = $("input:checkbox:checked");
  console.log(checked);
  for (const box of checked) {
    if (box.getAttribute("id") !== "selectAll") {
      console.log(box);
      ipcRenderer.send("copy-data", {
        grou: currentgroup,
        uuid: box.getAttribute("id").split("_")[0],
        data: "proxy",
      });
    }
  }
});

$("#copy-recovery").on("click", async () => {
  const checked = $("input:checkbox:checked");
  console.log(checked);
  for (const box of checked) {
    if (box.getAttribute("id") !== "selectAll") {
      console.log(box);
      ipcRenderer.send("copy-data", {
        grou: currentgroup,
        uuid: box.getAttribute("id").split("_")[0],
        data: "recovery",
      });
    }
  }
});

$("#copy-security").on("click", async () => {
  const checked = $("input:checkbox:checked");
  console.log(checked);
  for (const box of checked) {
    if (box.getAttribute("id") !== "selectAll") {
      console.log(box);

      ipcRenderer.send("copy-data", {
        grou: currentgroup,
        uuid: box.getAttribute("id").split("_")[0],
        data: "security",
      });
    }
  }
});

$("#manual-login").on("click", async function () {
  const checked = $("input:checkbox:checked");
  for (const box of checked) {
    if (box.getAttribute("id") !== "selectAll") {
      //manual-login
      ipcRenderer.send("manual-login", {
        uuid: box.getAttribute("id").split("_")[0],
        group: currentgroup,
      });
    }
  }
});

$("#test-v2v-sel").on("click", async function () {
  const groupTested = currentgroup;
  const checked = $("input:checkbox:checked");
  console.log(checked);
  const testThese = new Array();
  for (const box of checked) {
    if (box.getAttribute("id") !== "selectAll") {
      console.log(box);
      testThese.push(box.getAttribute("id").split("_")[0]);
      $(`#${box.getAttribute("id").split("_")[0]}_health`).html("Testing");
      $(`#${box.getAttribute("id").split("_")[0]}_health`).addClass(
        "orange lite-red"
      );
    }
  }
  //test-gmails, put type in arg
  ipcRenderer.send("test-gmails", {
    gmails: testThese,
    group: groupTested,
    type: "v2v",
  });
});

$("#test-v2i-sel").on("click", async function () {
  const groupTested = currentgroup;
  const checked = $("input:checkbox:checked");
  console.log(checked);
  const testThese = new Array();
  for (const box of checked) {
    if (box.getAttribute("id") !== "selectAll") {
      console.log(box);
      testThese.push(box.getAttribute("id").split("_")[0]);
      $(`#${box.getAttribute("id").split("_")[0]}_health`).html("Testing");
      $(`#${box.getAttribute("id").split("_")[0]}_health`).addClass(
        "orange lite-red"
      );
    }
  }
  //mark
  ipcRenderer.send("test-gmails", {
    gmails: testThese,
    group: groupTested,
    type: "v2i",
  });
});
$("#test-v3-sel").on("click", async function () {
  const groupTested = currentgroup;
  const checked = $("input:checkbox:checked");
  console.log(checked);
  const testThese = new Array();
  for (const box of checked) {
    if (box.getAttribute("id") !== "selectAll") {
      console.log(box);
      testThese.push(box.getAttribute("id").split("_")[0]);
      $(`#${box.getAttribute("id").split("_")[0]}_health`).html("Testing");
      $(`#${box.getAttribute("id").split("_")[0]}_health`).addClass(
        "orange lite-red"
      );
    }
  }
  ipcRenderer.send("test-gmails", {
    gmails: testThese,
    group: groupTested,
    type: "v3",
  });
});

const addGmailstoTable = (groupGmails, filter = false) => {
  let point9 = 0;
  let point7 = 0;
  let v2i = 0;
  let v2v = 0;
  let bad = 0;
  //$('#gmail-filters').append(``)
  if (!filter) {
    $("#allTask-text").text(Object.values(groupGmails).length);
  }

  $("#allTask").on("click", async function () {
    $(`#${$(".active")[1].getAttribute("id")}`).toggleClass("active");
    $("#allTask").toggleClass("active");
    //load-gmails
    const nonFiltered = ipcRenderer.sendSync("load-gmails", {
      groupID: currentgroup,
      initial: false,
    });
    $("#gmail-tbody").empty();
    addGmailstoTable(nonFiltered, true);
  });

  $("#point9-btn").on("click", async function () {
    console.log(".9 filter");
    console.log($(".active"));
    $(`#${$(".active")[1].getAttribute("id")}`).toggleClass("active");
    $("#point9-btn").toggleClass("active");
    //load-gmails
    const nonFiltered = ipcRenderer.sendSync("load-gmails", {
      groupID: currentgroup,
      initial: false,
    });
    Object.values(nonFiltered).forEach((gmail) => {
      if (gmail.score.v3 !== "0.9") {
        delete nonFiltered[gmail.uuid];
      }
    });
    $("#gmail-tbody").empty();
    addGmailstoTable(nonFiltered, true);
  });

  $("#point7-btn").on("click", async function () {
    $(`#${$(".active")[1].getAttribute("id")}`).toggleClass("active");
    $("#point7-btn").toggleClass("active");
    console.log(".7 filter");
    //load-gmails
    const nonFiltered = ipcRenderer.sendSync("load-gmails", {
      groupID: currentgroup,
      initial: false,
    });
    Object.values(nonFiltered).forEach((gmail) => {
      if (gmail.score.v3 !== "0.7" || gmail.score.v3 !== "0.9") {
        delete nonFiltered[gmail.uuid];
      }
    });
    $("#gmail-tbody").empty();
    addGmailstoTable(nonFiltered, true);
  });

  $("#v2i-btn").on("click", async function () {
    console.log("v2i filter");
    $(`#${$(".active")[1].getAttribute("id")}`).toggleClass("active");
    $("#v2i-btn").toggleClass("active");
    //load-gmails
    const nonFiltered = ipcRenderer.sendSync("load-gmails", {
      groupID: currentgroup,
      initial: false,
    });
    Object.values(nonFiltered).forEach((gmail) => {
      if (gmail.score.v2i !== true) {
        delete nonFiltered[gmail.uuid];
      }
    });
    $("#gmail-tbody").empty();
    addGmailstoTable(nonFiltered, true);
  });

  $("#v2v-btn").on("click", async function () {
    console.log("v2v filter");
    $(`#${$(".active")[1].getAttribute("id")}`).toggleClass("active");
    $("#v2v-btn").toggleClass("active");
    //load-gmails
    const nonFiltered = ipcRenderer.sendSync("load-gmails", {
      groupID: currentgroup,
      initial: false,
    });
    Object.values(nonFiltered).forEach((gmail) => {
      if (gmail.score.v2v !== true) {
        delete nonFiltered[gmail.uuid];
      }
    });
    $("#gmail-tbody").empty();
    addGmailstoTable(nonFiltered, true);
  });

  $("#bad-btn").on("click", async function () {
    console.log("bad filter");
    $(`#${$(".active")[1].getAttribute("id")}`).toggleClass("active");
    $("#bad-btn").toggleClass("active");
    //load-gmails
    const nonFiltered = ipcRenderer.sendSync("load-gmails", {
      groupID: currentgroup,
      initial: false,
    });
    Object.values(nonFiltered).forEach((gmail) => {
      if ($(`#${gmail.uuid}_health`).html() !== "Bad") {
        delete nonFiltered[gmail.uuid];
      }
    });
    $("#gmail-tbody").empty();
    addGmailstoTable(nonFiltered, true);
  });

  Object.values(groupGmails).forEach((gmail) => {
    if (gmail.score.v3 === "0.9") {
      point9++;
    } else if (gmail.score.v3 === "0.7") {
      point7++;
    }
    if (gmail.score.v2i === true) {
      v2i++;
    }
    if (gmail.score.v2v === true) {
      v2v++;
    }

    console.log(gmail);
    let defaultGmails = `<tr id="${gmail.uuid}">
        <th style="text-align: center;border: 1px solid #1D1926;width: 50px;" scope="row"><input  type="checkbox" id="${gmail.uuid}_checkbox"></th>
        <td id="${gmail.uuid}-name">${gmail.email}</td>
        <td id="${gmail.uuid}-proxy">${gmail.proxy}</td>
        <td id="${gmail.uuid}_health1"><i style="font-size: 10px;margin-right: 5px;" class="fas fa-circle"></i> <span class="health" id="${gmail.uuid}_health"> ...</span>   </td>
        <td class="status" id="${gmail.uuid}-status">${gmail.status}</td>
        <td><div class="text-white d-flex align-items-center justify-content-end ">
            <span class="d-inline-flex align-items-center" style="font-size: 12px;margin-right: 5px;"><button class=" text-white p-0 border-0  bg-transparent" id="${gmail.uuid}-start"><span class="run icon-btn d-inline-block" id="${gmail.uuid}-run-span"></span>  </button> </span>
            <span class="d-inline-flex align-items-center" style="font-size: 12px;margin-right: 5px;"><button class="text-white  p-0 border-0  bg-transparent" id="${gmail.uuid}-edit"><span class="edit-ic icon-btn d-inline-block"></span>  </button> </span>
            <span class="d-inline-flex align-items-center" style="font-size: 12px;"><button  class="text-white  p-0 border-0  bg-transparent" id="${gmail.uuid}-delete"><span class="delete-ic-r icon-btn d-inline-block"></span>  </button> </span>
        </div></td>
        </tr>`;
    tableBody.append(defaultGmails);
    console.log(gmail.score);
    if (
      gmail.score.v3 === "" &&
      gmail.score.v2i === "" &&
      gmail.score.v2v === ""
    ) {
      $(`#${gmail.uuid}_health`).html("Untested");
    } else {
      //WHICH GMAILS ARE GOOD/BAD HEALTH
      if ($(`#${currentgroup}_tags`).html() === "Shopify") {
        //V2V = TRUE === GOOD
        if (gmail.score.v2v === true) {
          $(`#${gmail.uuid}_health`).html("Good");
        } else {
          $(`#${gmail.uuid}_health`).html("Bad");
          bad++;
        }
      } else if ($(`#${currentgroup}_tags`).html() === "Yeezysupply") {
        //0.7 OR 0.7 === GOOD
        if (gmail.score.v3 === "0.9" || gmail.score.v3 === "0.7") {
          $(`#${gmail.uuid}_health`).html("Good");
          $(`#${gmail.uuid}_health1`).addClass("green");
        } else {
          $(`#${gmail.uuid}_health`).html("Bad");
          $(`#${gmail.uuid}_health1`).addClass("orange lite-red");
          bad++;
        }

        //V2I = TRUE === GOOD
      } else if ($(`#${currentgroup}_tags`).html() === "Supreme") {
        if (gmail.score.v2i === true) {
          $(`#${gmail.uuid}_health`).html("Good");
        } else {
          $(`#${gmail.uuid}_health`).html("Bad");
          bad++;
        }

        //V2V = TRUE === GOOD
      } else if ($(`#${currentgroup}_tags`).html() === "Footsites") {
        if (gmail.score.v2v === true) {
          $(`#${gmail.uuid}_health`).html("Good");
        } else {
          $(`#${gmail.uuid}_health`).html("Bad");
          bad++;
        }
      } else {
        //OTHER TAG, 0.7/0.9 === GOOD
        if (gmail.score.v3 === "0.9" || gmail.score.v3 === "0.7") {
          $(`#${gmail.uuid}_health`).html("Good");
          $(`#${gmail.uuid}_health1`).addClass("green");
        } else {
          $(`#${gmail.uuid}_health`).html("Bad");
          $(`#${gmail.uuid}_health1`).addClass("lite-red");
          bad++;
        }
      }
    }

    //RIGHT CLICK
    $(`#${gmail.uuid}`).on("contextmenu", function (event) {
      if (!$(`#${gmail.uuid}_checkbox`).prop("checked")) {
        const checked = $("input:checkbox:checked");
        for (const box of checked) {
          if (box.getAttribute("id") !== event.target.getAttribute("id")) {
            $(`#${box.getAttribute("id")}`).prop("checked", false);
          }
        }
        $(`#${gmail.uuid}_checkbox`).prop("checked", true);
      }
      console.log("he right click on", gmail.uuid);
      console.log(event);
      showCM(true);
      $(".custom-cm").css("top", event.pageY);
      $(".custom-cm").css("left", event.pageX);
    });

    //SELECTS GMAIL ON CLICK
    $(`#${gmail.uuid}`).on("click", async function (event) {
      if (event.target.getAttribute("id") !== `${gmail.uuid}_checkbox`) {
        const checked = $("input:checkbox:checked");
        for (const box of checked) {
          if (box.getAttribute("id") !== event.target.getAttribute("id")) {
            $(`#${box.getAttribute("id")}`).prop("checked", false);
          }
        }
        const ischecked = $(`#${gmail.uuid}_checkbox`).is(":checked");
        console.log(ischecked, "not", !ischecked);
        $(`#${gmail.uuid}_checkbox`).prop("checked", !ischecked);
      }
    });

    //START GMAIL
    $(`#${gmail.uuid}-start`).on("click", async function () {
      console.log("starting gmail", gmail.uuid);
      //action-specific
      ipcRenderer.send("action-specific", {
        gmail: gmail.uuid,
        group: currentgroup,
      });

      //EDIT THE GMAIL
      $(`#${gmail.uuid}-edit`).on("click", async function () {
        console.log("editing gmail", gmail.uuid, currentgroup);
        //get-gmail
        const parsedgmail = ipcRenderer.sendSync("get-gmail", {
          gmailID: gmail.uuid,
          groupID: currentgroup,
        });
        jQuery("#gmailEditModal").modal("show");
        document.getElementById("edit-email").value = parsedgmail.email;
        document.getElementById("edit-password").value = parsedgmail.password;
        document.getElementById("edit-recov").value = parsedgmail.recovery;
        document.getElementById("edit-security").value = parsedgmail.security;
        $("#cancel-edit").on("click", () =>
          $("#edit-gmail-submit").off("click")
        );
        $("#edit-gmail-submit").on("click", async function () {
          //edit-gmail
          ipcRenderer.send("edit-gmail", {
            uuid: gmail.uuid,
            group: currentgroup,
            newGmail: document.getElementById("edit-email").value,
            newPass: document.getElementById("edit-password").value,
            newRecov: document.getElementById("edit-recov").value,
            newSecurity: document.getElementById("edit-security").value,
          });
          $(`#${gmail.uuid}-name`).html(
            document.getElementById("edit-email").value
          );
          //$(`#${gmail.uuid}-proxy`).html('newproxygohere')

          $("#edit-gmail-submit").off("click");
          $("#cancel-edit").off("click");
        });
      });

      //DELETE THE GMAIL
      $(`#${gmail.uuid}-delete`).on("click", async function () {
        console.log("deleting gmail", gmail.uuid);
        //delete-gmail
        ipcRenderer.send("delete-gmail", {
          groupID: currentgroup,
          gmailID: gmail.uuid,
        });
        if ($(`#${gmail.uuid}-status`).text() === "Idle") {
          changeStopNum(currentgroup, false);
        } else {
          changeStartNum(currentgroup, false);
        }
        $(`#${gmail.uuid}`).remove();
      });

      $(`#${gmail.uuid}_health1`).on("mouseover", async function (event) {
        console.log("hover", gmail.uuid);
        //get-scores

        ipcRenderer.send("get-scores", {
          group: currentgroup,
          gmail: gmail.uuid,
          pos: {
            x: event.pageX,
            y: event.pageY,
          },
        });
      });
      $(`#${gmail.uuid}_health1`).on("mouseleave", async function (event) {
        console.log("leave", gmail.uuid);
        $(".health-menu").css("display", "none");
        // $('.health-menu').css("top", event.pageY)
        // $('.health-menu').css("left", event.pageX)
      });
    });

    $("#point9-filter").html(`${point9}`);
    $("#point7-filter").html(`${point7}`);
    $("#v2v-filter").html(`${v2v}`);
    $("#v2i-filter").html(`${v2i}`);
    $("#bad-filter").html(`${bad}`);
  });
};

////////////////////////////////////////
////////////////////////////////////////
//
// N E W   G M A I L
//
////////////////////////////////////////
////////////////////////////////////////

$("#open-gmail-modal").on("click", () => {
  console.log("modal opened");
  const parsedProxies = ipcRenderer.sendSync("get-proxies", {
    initial: false,
    group: undefined,
  });
  console.log(parsedProxies);
  if (parsedProxies["default"].proxies !== {}) {
    Object.values(parsedProxies["default"].proxies).forEach((proxy) => {
      $("#spec-proxy-input").append(
        `<option value="${proxy.proxy}" id="${proxy.uuid}">${proxy.proxy}</option>`
      );
    });
  }
  Object.values(parsedProxies).forEach((group) => {
    $("#proxy-group-input").append(
      `<option value="${group.uuid}" id="${group.uuid}">${group.name}</option>`
    );
    $(`#${group.uuid}`).on("click", () => {
      $("#spec-proxy-input").empty();
      console.log(`clicked ${parsedProxies[group.uuid].name}`);
      Object.values(parsedProxies[group.uuid].proxies).forEach((proxy) => {
        $("#spec-proxy-input").append(
          `<option value="${proxy.proxy}" id="${proxy.uuid}">${proxy.proxy}</option>`
        );
      });
    });
  });
});

$("#new-gmail-submit").on("click", async function () {
  //get-proxies
  //new-gmail
  const gmail = ipcRenderer.sendSync("new-gmail", {
    email: document.getElementById("email-address-input").value,
    pass: document.getElementById("password-input").value,
    recov: document.getElementById("recovery-input").value,
    sec_q: document.getElementById("security-q-input").value,
    proxy: document.getElementById("spec-proxy-input").value,
    groupID: currentgroup,
  });
  console.log("got the gmail! adding...");
  console.log("adding", gmail);
  let markup = `<tr id="${gmail.uuid}">
  <th style="text-align: center;border: 1px solid #1D1926;width: 50px;" scope="row"><input  type="checkbox" id="${gmail.uuid}_checkbox"></th>
  <td id="${gmail.uuid}-name">${gmail.email}</td>
  <td id="${gmail.uuid}-proxy">${gmail.proxy}</td>
  <td id="${gmail.uuid}_health1"><i style="font-size: 10px;margin-right: 5px;" class="fas fa-circle"></i> <span class="health" id="${gmail.uuid}_health"> Untested</span>   </td>
  <td class="status" id="${gmail.uuid}-status">Idle</td>
  <td><div class="text-white d-flex align-items-center justify-content-end ">
      <span class="d-inline-flex align-items-center" style="font-size: 12px;margin-right: 5px;"><button class=" text-white p-0 border-0  bg-transparent" id="${gmail.uuid}-start"><span class="run icon-btn d-inline-block" id="${gmail.uuid}-run-span"></span>  </button> </span>
      <span class="d-inline-flex align-items-center" style="font-size: 12px;margin-right: 5px;"><button class="text-white  p-0 border-0  bg-transparent" id="${gmail.uuid}-edit"><span class="edit-ic icon-btn d-inline-block"></span>  </button> </span>
      <span class="d-inline-flex align-items-center" style="font-size: 12px;"><button  class="text-white  p-0 border-0  bg-transparent" id="${gmail.uuid}-delete"><span class="delete-ic-r icon-btn d-inline-block"></span>  </button> </span>
  </div></td>
  </tr>`;
  tableBody.append(markup);
  changeStopNum(currentgroup, true);
  const all = parseInt($(`#allTask-text`).text()) + 1;
  console.log($(`#allTask-text`).text());
  $("#allTask-text").text(`${all}`);
  //START GMAIL

  ////////////////////////////////////////
  ////////////////////////////////////////
  // R I G H T    C L I C K    M E N U
  ////////////////////////////////////////
  ////////////////////////////////////////
  $(`#${gmail.uuid}`).on("contextmenu", function (event) {
    if (!$(`#${gmail.uuid}_checkbox`).prop("checked")) {
      const checked = $("input:checkbox:checked");
      for (const box of checked) {
        if (box.getAttribute("id") !== event.target.getAttribute("id")) {
          $(`#${box.getAttribute("id")}`).prop("checked", false);
        }
      }
      $(`#${gmail.uuid}_checkbox`).prop("checked", true);
    }
    console.log("he right click on", gmail.uuid);
    console.log(event);
    showCM(true);
    $(".custom-cm").css("top", event.pageY);
    $(".custom-cm").css("left", event.pageX);
  });
  ////////////////////////////////////////
  ////////////////////////////////////////
  // C H E C K B O X    S T U F F
  ////////////////////////////////////////
  ////////////////////////////////////////
  $(`#${gmail.uuid}`).on("click", async function (event) {
    if (event.target.getAttribute("id") !== `${gmail.uuid}_checkbox`) {
      const checked = $("input:checkbox:checked");
      for (const box of checked) {
        if (box.getAttribute("id") !== event.target.getAttribute("id")) {
          $(`#${box.getAttribute("id")}`).prop("checked", false);
        }
      }
      const ischecked = $(`#${gmail.uuid}_checkbox`).is(":checked");
      console.log(ischecked, "not", !ischecked);
      $(`#${gmail.uuid}_checkbox`).prop("checked", !ischecked);
    }
  });

  ////////////////////////////////////////
  ////////////////////////////////////////
  // S T A R T / S T O P
  ////////////////////////////////////////
  ////////////////////////////////////////
  $(`#${gmail.uuid}-start`).on("click", async function () {
    console.log("starting gmail", gmail.uuid);
    //action-specific
    ipcRenderer.send("action-specific", {
      gmail: gmail.uuid,
      group: currentgroup,
    });
  });

  ////////////////////////////////////////
  ////////////////////////////////////////
  // E D I T
  ////////////////////////////////////////
  ////////////////////////////////////////
  $(`#${gmail.uuid}-edit`).on("click", async function () {
    console.log("editing gmail", gmail.uuid, currentgroup);
    //edit-gmail
    const parsedgmail = ipcRenderer.sendSync("get-gmail", {
      gmailID: gmail.uuid,
      groupID: currentgroup,
    });
    jQuery("#gmailEditModal").modal("show");
    document.getElementById("edit-email").value = parsedgmail.email;
    document.getElementById("edit-password").value = parsedgmail.password;
    document.getElementById("edit-recov").value = parsedgmail.recovery;
    document.getElementById("edit-security").value = parsedgmail.security;
    $("#cancel-edit").on("click", () => $("#edit-gmail-submit").off("click"));
    $("#edit-gmail-submit").on("click", async function () {
      //edit-gmail

      ipcRenderer.send("edit-gmail", {
        uuid: gmail.uuid,
        group: currentgroup,
        newGmail: document.getElementById("edit-email").value,
        newPass: document.getElementById("edit-password").value,
        newRecov: document.getElementById("edit-recov").value,
        newSecurity: document.getElementById("edit-security").value,
      });
      $(`#${gmail.uuid}-name`).html(
        document.getElementById("edit-email").value
      );
      //$(`#${gmail.uuid}-proxy`).html('newproxygohere')

      $("#edit-gmail-submit").off("click");
      $("#cancel-edit").off("click");
    });
  });

  ////////////////////////////////////////
  ////////////////////////////////////////
  // D E L E T E
  ////////////////////////////////////////
  ////////////////////////////////////////
  $(`#${gmail.uuid}-delete`).on("click", async function () {
    console.log("deleting gmail", gmail.uuid);
    //delete-gmail
    ipcRenderer.send("delete-gmail", {
      groupID: currentgroup,
      gmailID: gmail.uuid,
    });
    if ($(`#${gmail.uuid}-status`).text() === "Idle") {
      changeStopNum(currentgroup, false);
    } else {
      changeStartNum(currentgroup, false);
    }
    $(`#${gmail.uuid}`).remove();
  });

  ////////////////////////////////////////
  ////////////////////////////////////////
  // H E A L T H    M E N U
  ////////////////////////////////////////
  ////////////////////////////////////////
  $(`#${gmail.uuid}_health1`).on("mouseover", async function (event) {
    console.log("hover", gmail.uuid);
    //get-scores
    ipcRenderer.send("get-scores", {
      group: currentgroup,
      gmail: gmail.uuid,
      pos: {
        x: event.pageX,
        y: event.pageY,
      },
    });
  });
  $(`#${gmail.uuid}_health1`).on("mouseleave", async function (event) {
    console.log("leave", gmail.uuid);
    $(".health-menu").css("display", "none");
  });
});

$("#exampleModal").on("show.bs.modal", () => {
  console.log("show examplemodal");
  $("#new-gmail-group-name").text($(`${currentgroup}_name`).text());
});

$("#gmailEditModal").on("shown", () => {
  console.log("show");
  $("#gmail-edit-group-name").text($(`${currentgroup}_name`).text());
});

////////////////////////////////////////
////////////////////////////////////////
//
// G R O U P     L I S T E N E R S
//
////////////////////////////////////////
////////////////////////////////////////
$("#new-group-submit").on("click", async function () {
  //new-group
  console.log("new group");
  const parsed = ipcRenderer.sendSync("new-group", {
    name: document.getElementById("group-name-input").value,
    tags: document.getElementById("select-tags").value,
  });
  console.log("GOT GROUP OBJECT", parsed);
  $(`#${currentgroup}`).css("border", "");
  currentgroup = parsed.uuid;
  await addGrouptoList(parsed.name, parsed.tags, parsed.uuid, 0);

  $(`#${parsed.uuid}`).css("border", "1px solid #733fcc");

  $("#gmail-tbody").empty();
});

$("#start-all-currentgroup").on("click", async function () {
  //start-all
  ipcRenderer.send("start-all", { groupID: currentgroup });

  let stopped = parseInt($(`#${currentgroup}-stop-number`).html());
  let running = parseInt($(`#${currentgroup}-start-number`).html());
  $(`#${currentgroup}-start-number`).html(stopped + running);
  $(`#${currentgroup}-stop-number`).html("0");
});

$("#stop-all-currentgroup").on("click", async function () {
  //stop-all
  ipcRenderer.send("stop-all", { groupID: currentgroup });
  let stopped = parseInt($(`#${currentgroup}-stop-number`).html());
  let running = parseInt($(`#${currentgroup}-start-number`).html());
  $(`#${currentgroup}-start-number`).html("0");
  $(`#${currentgroup}-stop-number`).html(stopped + running);
});

////////////////////////////////////////
////////////////////////////////////////
//
// M I S C     O P T I O N S
//
////////////////////////////////////////
////////////////////////////////////////

$("#close-button").on("click", async function () {
  const win = remote.getCurrentWindow();
  win.close();
});

$("#minimize-button").on("click", async function () {
  const win = remote.getCurrentWindow();
  win.minimize();
});

$("#import-btn").on("click", () => {
  console.log("clicked import");
  ipcRenderer.send("open-file-dialog", "gmails");
});

ipcRenderer.on("import-gmails", async function (event, path) {
  //do what you want with the path/file selected, for example:
  console.log(`You selected: ${path}`);
  //import-gmails
  ipcRenderer.send("import-gmails-path", path);
});
//IPC RENDERER REPLIES
ipcRenderer.on("action-specific-reply", (event, arg) => {
  if (arg.started === "qd") {
    //queued
    $(`#${box.getAttribute("id").split("_")[0]}-status`).text("Queued");
  } else if (arg.started) {
    //started
    $(`#${box.getAttribute("id").split("_")[0]}-run-span`)
      .toggleClass("run")
      .toggleClass("stop");
    changeStartNum(currentgroup, true);

    changeStopNum(currentgroup, false);
  } else {
    //stoped
    $(`#${box.getAttribute("id").split("_")[0]}-status`).html("Idle");
    $(`#${box.getAttribute("id").split("_")[0]}-run-span`)
      .toggleClass("run")
      .toggleClass("stop");
    changeStartNum(currentgroup, false);

    changeStopNum(currentgroup, true);
  }
});

ipcRenderer.on("test-gmails", (event, { results, type }) => {
  //type is either
  //v2v
  //v2i
  //v3
  for (const result of results) {
    const parsedResult = JSON.parse(result);
    if (parsedResult.errors) {
      $(`#${parsedResult.id}_health`).html("Error Testing!");
      $(`#${parsedResult.id}_health`)
        .removeClass("orange lite-red")
        .addClass("lite-red");
    } else {
      // $(`#${parsedResult.uuid}_health`).html(parsedResult.score)
      if ($(`#${groupTested}_tags`).html() === "Shopify") {
        if (gmail.score.v2v === true) {
          $(`#${gmail.uuid}_health`).html("Good");
          const v2vInt = parseInt($("#v2v-filter").html()) + 1;
          $("#v2v-filter").html(v2vInt);
        } else {
          $(`#${gmail.uuid}_health`).html("Bad");
          const bad = parseInt($("#bad-filter").html()) + 1;
          $("#bad-filter").html(bad);
        }
      } else if ($(`#${groupTested}_tags`).html() === "Footsites") {
        if (gmail.score.v2v === true) {
          $(`#${gmail.uuid}_health`).html("Good");
          const v2vInt = parseInt($("#v2v-filter").html()) + 1;
          $("#v2v-filter").html(v2vInt);
        } else {
          $(`#${gmail.uuid}_health`).html("Bad");
          const bad = parseInt($("#bad-filter").html()) + 1;
          $("#bad-filter").html(bad);
        }
      }
    }
  }
});

ipcRenderer.on("get-scores-reply", (event, arg) => {
  const { x_val, y_val } = arg.pos;
  const { v3, v2i, v2v } = arg.scores;
  $(".health-menu").css("display", "block");
  $(".health-menu").css("top", y_val);
  $(".health-menu").css("left", x_val);
  $("#v3-score").html(`v3 Score - ${v3}`);
  $("#v2i-score").html(`v2 Invis Score - ${v2i}`);
  $("#v2v-score").html(`v2 Vis Score - ${v2v}`);
});

ipcRenderer.on("new-statuses", (event, parsedStatus) => {
  if (
    typeof parsedStatus.statuses !== "undefined" &&
    parsedStatus.statuses.length > 0
  ) {
    parsedStatus.statuses.forEach((status) => {
      $(`#${status.uuid}-status`).html(status.status);
    });
  }
});

ipcRenderer.on("import-gmails-path-reply", (event, arg) => {
  const importParsed = arg;
  Object.values(importParsed).forEach((group) => {
    if (group.name !== "default") {
      addGrouptoList(
        group.name,
        group.tags,
        group.uuid,
        Object.values(group.gmails).length
      );
    }
  });
  $("#gmail-filters").empty();
  $("#selectAll").prop("checked", false);
  $(`#${currentgroup}`).css("border", "");
  $("#default").css("border", "1px solid #733fcc");
  $("#gmail-tbody").empty();
  addGmailstoTable(importParsed.default);
  currentgroup = "default";
});

ipcRenderer.on("test-gmails-reply", (event, results) => {
  for (const result of results) {
    if (result.errors) {
      $(`#${result.id}_health`).html("Error Testing!");
      $(`#${result.id}_health`)
        .removeClass("orange lite-red")
        .addClass("lite-red");
    } else {
      // $(`#${parsedResult.uuid}_health`).html(parsedResult.score)
      if ($(`#${groupTested}_tags`).html() === "Supreme") {
        if (gmail.score.v2i === true) {
          $(`#${gmail.uuid}_health`).html("Good");
          const v2iInt = parseInt($("#v2i-filter").html()) + 1;
          $("#v2v-filter").html(v2iInt);
        } else {
          $(`#${gmail.uuid}_health`).html("Bad");
          const bad = parseInt($("#bad-filter").html()) + 1;
          $("#bad-filter").html(bad);
        }
      }
    }
  }
});

const start = async () => {
  console.log("started");
  $("#default").css("border", "1px solid #733fcc");

  const msg = ipcRenderer.sendSync("load-gmails", {
    groupID: undefined,
    initial: true,
  });
  console.log("MESSAGE", msg);

  if (msg.gmails !== "undefined") {
    console.log("gmails found");

    //LISTENERS AND JQUERY FOR EVERY SINGLE GMAIL IN DEFAULT GROUP
    const allGmails = msg;
    console.log("DEFAULT GMAILS", allGmails);
    let number = Object.keys(allGmails.default.gmails).length;
    $("#insert-default-stats")
      .append(`<span class="d-inline-flex align-items-center" style="font-size: 12px;" id="default_startall"><button class="icon-btn p-0 border-0 run bg-transparent" ></button> <span id="default-start-number">0</span> </span>
        <span class="d-inline-flex align-items-center" style="font-size: 12px;" id="default_stopall"><button class="icon-btn p-0 border-0 stop bg-transparent" ></button> <span id="default-stop-number">${number}</span> </span>
        <span class="d-inline-flex align-items-center" style="font-size: 12px;" id="default_point9s"><button style="background-size: 12px;" class="icon-btn p-0 border-0 check bg-transparent"></button> <span id="default-point9-number">0</span> </span>`);
    addGmailstoTable(allGmails.default.gmails);
    if (Object.keys(allGmails).length > 1) {
      for (const group in allGmails) {
        if (group !== "default") {
          console.log(group);
          addGrouptoList(
            allGmails[group].name,
            allGmails[group].tags,
            allGmails[group].uuid,
            Object.keys(allGmails[group].gmails).length
          );
        }
      }
    }

    //LISTENERS FOR THE GROUP ITSELF
  } else {
    console.log("none");
    $("#insert-default-stats")
      .append(`<span class="d-inline-flex align-items-center" style="font-size: 12px;" id="default_startall"><button class="icon-btn p-0 border-0 run bg-transparent" ></button> <span id="default-start-number">0</span> </span>
        <span class="d-inline-flex align-items-center" style="font-size: 12px;" id="default_stopall"><button class="icon-btn p-0 border-0 stop bg-transparent" ></button> <span id="default-stop-number">0</span> </span>
        <span class="d-inline-flex align-items-center" style="font-size: 12px;" id="default_point9s"><button style="background-size: 12px;" class="icon-btn p-0 border-0 check bg-transparent"></button> <span id="default-point9-number">0</span> </span>`);
    $("#point9-filter").html(`0`);
    $("#point7-filter").html(`0`);
    $("#v2v-filter").html(`0`);
    $("#v2i-filter").html(`0`);
    $("#bad-filter").html(`0`);
  }

  var requestStatuses = setInterval(async () => {
    ipcRenderer.send("request-gmail-statuses");
  }, 2500);
};

$("#default").on("click", async function (event) {
  if (event.target.getAttribute("id").includes("edit")) {
    console.log("edit default");
    jQuery("#groupEditModal").modal("show");
    $("#edit-group-submit").on("click", async () => {
      //edit-group
      ipcRenderer.send("edit-group", {
        name: document.getElementById("edited-group-name").value,
        tags: document.getElementById("edited-group-tags").value,
        uuid: event.target.getAttribute("id").split("_")[0],
      });
      $(`#default_name`).html(
        document.getElementById("edited-group-name").value
      );
      $(`#default_tags`).html(
        document.getElementById("edited-group-tags").value
      );
      jQuery("#groupEditModal").modal("hide");
      $("#edit-group-submit").off("click");
    });
  } else if (event.target.getAttribute("id").includes("delete")) {
    console.log("delete default");
  } else {
    console.log("default clicked");
    if (currentgroup !== "default") {
      $("#gmail-filters").empty();
      $("#selectAll").prop("checked", false);
      $(`#${currentgroup}`).css("border", "");
      $("#default").css("border", "1px solid #733fcc");
      //load-gmails
      const defaultParsed = ipcRenderer.sendSync("load-gmails", {
        groupID: "default",
        initial: false,
      });
      $("#gmail-tbody").empty();
      addGmailstoTable(defaultParsed);
      currentgroup = "default";
    }
  }
});

////////////////////////////////////////
////////////////////////////////////////
//
// A D D    G R O U P
// runs on importing and open
////////////////////////////////////////
////////////////////////////////////////
const addGrouptoList = (name, tags, uuid, num) => {
  $("#group-section").append(`<div class="side-card text-white" id="${uuid}">
                            <div class="d-flex align-items-center justify-content-between" id="${uuid}">
                                <span id="${uuid}_name">${name}</span>
                                <div class="d-flex align-items-center justify-content-between">
                                    <button style="margin-right: 5px;" class="border-0 p-0  edit-ic  icon-btn" id="${uuid}_edit"></button>
                                    <button class="border-0 p-0  delete-ic  icon-btn" id="${uuid}_delete"></button>
                                </div>
                            </div>
                            <div id="${uuid}">
                                <span style="font-size:12px" id="${uuid}_tags">${tags}</span>
                            </div>
                            <div class="controls d-flex align-items-center justify-content-between" id="${uuid}">
                                <span class="d-inline-flex align-items-center" style="font-size: 12px;" id="${uuid}_startall"><button class="icon-btn p-0 border-0 run bg-transparent" ></button> <span id="${uuid}-start-number">0</span> </span>
                                <span class="d-inline-flex align-items-center" style="font-size: 12px;" id="${uuid}_stopall"><button class="icon-btn p-0 border-0 stop bg-transparent" ></button> <span id="${uuid}-stop-number">${num}</span> </span>
                                <span class="d-inline-flex align-items-center" style="font-size: 12px;" id="${uuid}_point9s"><button style="background-size: 12px;" class="icon-btn p-0 border-0 check bg-transparent" ></button> <span id="${uuid}-point9-number">0</span> </span>
                            </div>
                    </div>`);

  $(`#${uuid}`).on("click", async function (event) {
    console.log("user clicked on group", event.target.getAttribute("id"));
    if (event.target.getAttribute("id").includes("edit")) {
      console.log("edit");
      jQuery("#groupEditModal").modal("show");
      $("#edited-group-name").value = name;
      $("#edited-group-tags").value = tags;
      $("#edit-group-submit").on("click", async () => {
        //edit-group
        ipcRenderer.send("edit-group", {
          name: document.getElementById("edited-group-name").value,
          tags: document.getElementById("select-tags-edit").value,
          uuid: event.target.getAttribute("id").split("_")[0],
        });
        $(
          `#${event.target
            .getAttribute("id")
            .substring(0, event.target.getAttribute("id").length - 5)}_name`
        ).html(document.getElementById("edited-group-name").value);
        $(
          `#${event.target
            .getAttribute("id")
            .substring(0, event.target.getAttribute("id").length - 5)}_tags`
        ).html(document.getElementById("select-tags-edit").value);
        jQuery("#groupEditModal").modal("hide");
        $("#edit-group-submit").off("click");
      });
    } else if (event.target.getAttribute("id").includes("delete")) {
      console.log("delete da group");
      //delete-group
      ipcRenderer.send(
        "delete-group",
        event.target
          .getAttribute("id")
          .substring(0, event.target.getAttribute("id").length - 7)
      );
      $(
        `#${event.target
          .getAttribute("id")
          .substring(0, event.target.getAttribute("id").length - 7)}`
      ).remove();
    } else if (event.target.getAttribute("id") !== currentgroup) {
      $("#gmail-filters").empty();
      $("#selectAll").prop("checked", false);
      $(`#${currentgroup}`).css("border", "");
      $(`#${event.target.getAttribute("id")}`).css(
        "border",
        "1px solid #733fcc"
      );

      currentgroup = event.target.getAttribute("id");
      //gets gmails in a certain group from backend
      if (
        event.target.getAttribute("id").includes("name") ||
        event.target.getAttribute("id").includes("tags")
      ) {
        //load-gmails
        ipcRenderer.send("load-gmails", {
          groupID: event.target
            .getAttribute("id")
            .substring(0, event.target.getAttribute("id").length - 5),
          initial: false,
        });
      } else {
        //load-gmails
        ipcRenderer.send("load-gmails", {
          groupID: event.target.getAttribute("id"),
          initial: false,
        });
      }

      $("#gmail-tbody").empty();
      console.log(parsed);
      addGmailstoTable(parsed);
    }
  });

  $(`#${uuid}_startall`).on("click", async function (event) {
    //start-all
    ipcRenderer.send("start-all", {
      groupID: event.target.getAttribute(id).split("_")[0],
    });
    $(`#${gmail.uuid}-run-span`).toggleClass("run").toggleClass("stop");
  });

  $(`#${uuid}_stopall`).on("click", async function (event) {
    //stop-all
    ipcRenderer.send("stop-all", {
      groupID: event.target.getAttribute(id).split("_")[0],
    });
  });

  $(`#${uuid}_point9s`).on("click", async function (event) {
    //test-gmails
    //MARKER : FIGURE OUT WHAT EXACTLY THIS DOES
    await sock.send(
      JSON.stringify({
        module: "captcha",
        action: 8,
        groupID: currentgroup,
      })
    );
  });
};

start();
