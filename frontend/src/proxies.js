const { ipcRenderer, remote } = require("electron");
const $ = require("jquery");
const tableBody = $("table tbody");

let cmOpen = false;
let currentgroup = "default";

console.log("doc ready");
////////////////////////////////////////
////////////////////////////////////////
//
// U N I     U T I L S
//
////////////////////////////////////////
////////////////////////////////////////
$("#selectAll").on("click", function () {
  $("input:checkbox").not(this).prop("checked", this.checked);
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

////////////////////////////////////////
////////////////////////////////////////
//
// G R O U P     L I S T E N E R S
//
////////////////////////////////////////
////////////////////////////////////////

const addGrouptoList = (name, uuid, num) => {
  $("#group-section").append(`<div class="side-card text-white" id="${uuid}">
                <div class="d-flex align-items-center justify-content-between" id="${uuid}">
                    <span id="${uuid}_name">${name}</span>
                    <div class="d-flex align-items-center justify-content-between">
                        <button style="margin-right: 5px;" class="border-0 p-0  edit-ic  icon-btn" id="${uuid}_edit"></button>
                        <button class="border-0 p-0  delete-ic  icon-btn" id="${uuid}_delete"></button>
                    </div>
                </div>
                <div class="controls d-flex align-items-center justify-content-between" id="${uuid}">
                    <span class="d-inline-flex align-items-center" style="font-size: 12px;" id="${uuid}_startall"><button class="icon-btn p-0 border-0 run bg-transparent" ></button> <span id="${uuid}_start_num">0</span> </span>
                    <span class="d-inline-flex align-items-center" style="font-size: 12px;" id="${uuid}_stopall"><button class="icon-btn p-0 border-0 stop bg-transparent" ></button> <span id="${uuid}_stop_num">${num}</span> </span>
                    <span class="d-inline-flex align-items-center" style="font-size: 12px;" id="${uuid}_point9s"><button style="background-size: 12px;" class="icon-btn p-0 border-0 check bg-transparent" ></button> <span id="${uuid}_good_num">0</span> </span>
                </div>
            </div>`);

  $(`#${uuid}`).on("click", async function (event) {
    console.log("user clicked on group", event.target.getAttribute("id"));
    if (event.target.getAttribute("id").includes("edit")) {
      console.log("edit");
      jQuery("#groupEditModal").modal("show");
      $("#edited-group-name").value = name;
      $("#edit-group-submit").on("click", async () => {
        ipcRenderer.send("edit-proxy-group", {
          name: document.getElementById("edited-group-name").value,
          uuid: event.target.getAttribute("id").split("_")[0],
        });
        $(
          `#${event.target
            .getAttribute("id")
            .substring(0, event.target.getAttribute("id").length - 5)}_name`
        ).html(document.getElementById("edited-group-name").value);
        jQuery("#groupEditModal").modal("hide");
        $("#edit-group-submit").off("click");
      });
    } else if (event.target.getAttribute("id").includes("delete")) {
      console.log("delete da group");
      ipcRenderer.send(
        "delete-proxy-group",
        event.target.getAttribute("id").split("_")[0]
      );
      $(`#${event.target.getAttribute("id").split("_")[0]}`).remove();
    } else if (event.target.getAttribute("id") !== currentgroup) {
      // $('#proxy-filters').empty()
      $("#allTask-text").text("0");
      $("#selectAll").prop("checked", false);
      $(`#${currentgroup}`).css("border", "");
      $(`#${event.target.getAttribute("id")}`).css(
        "border",
        "1px solid #733fcc"
      );

      currentgroup = event.target.getAttribute("id").includes("name")
        ? event.target.getAttribute("id").split("_")[0]
        : event.target.getAttribute("id");
      const parsed = ipcRenderer.sendSync("get-proxies", {
        initial: false,
        group: event.target.getAttribute("id").includes("name")
          ? event.target.getAttribute("id").split("_")[0]
          : event.target.getAttribute("id"),
      });

      $("#proxy-tbody").empty();
      console.log(parsed);
      addProxiesToTable(parsed);
    }
  });
};

$("#new-group-submit").on("click", async function () {
  const parsed = ipcRenderer.sendSync(
    "add-proxy-group",
    document.getElementById("group-name-input").value
  );
  document.getElementById("group-name-input").value = "";
  console.log("GOT GROUP OBJECT", parsed);
  $(`#${currentgroup}`).css("border", "");
  currentgroup = parsed.uuid;
  await addGrouptoList(parsed.name, parsed.uuid, 0);

  $(`#${parsed.uuid}`).css("border", "1px solid #733fcc");

  $("#proxy-tbody").empty();
});

////////////////////////////////////////
////////////////////////////////////////
//
// P R O X Y    F U N C S
//
////////////////////////////////////////
////////////////////////////////////////

const addProxiesToTable = (proxies, filter = false) => {
  if (!filter) {
    $("#allTask-text").text(Object.values(proxies).length);
  }
  let sub100 = 0,
    one_to_five = 0,
    five_to_thou = 0,
    thou_to_two = 0,
    two_plus = 0;
  $("#allTask").on("click", async function () {
    $(`#${$(".active")[1].getAttribute("id")}`).toggleClass("active");
    $("#allTask").toggleClass("active");
    const nonFiltered = ipcRenderer.sendSync("get-proxies", {
      initial: false,
      group: currentgroup,
    });
    $("#proxy-tbody").empty();

    addProxiesToTable(nonFiltered, true);
  });

  $("#100ms").on("click", async function () {
    console.log("100ms filter");
    console.log($(".active"));
    $(`#${$(".active")[1].getAttribute("id")}`).toggleClass("active");
    $("#100ms").toggleClass("active");
    const nonFiltered = ipcRenderer.sendSync("get-proxies", {
      initial: false,
      group: currentgroup,
    });
    Object.values(nonFiltered).forEach((proxy) => {
      if (!(proxy.speed <= 100)) {
        delete nonFiltered[proxy.uuid];
      }
    });
    $("#proxy-tbody").empty();
    addProxiesToTable(nonFiltered, true);
  });

  $("#100-500ms").on("click", async function () {
    $(`#${$(".active")[1].getAttribute("id")}`).toggleClass("active");
    $("#100-500ms").toggleClass("active");
    console.log("100-500ms filter");
    const nonFiltered = ipcRenderer.sendSync("get-proxies", {
      initial: false,
      group: currentgroup,
    });
    Object.values(nonFiltered).forEach((proxy) => {
      if (!(proxy.speed > 100 && proxy.speed <= 500)) {
        delete nonFiltered[proxy.uuid];
      }
    });
    $("#proxy-tbody").empty();
    addProxiesToTable(nonFiltered, true);
  });

  $("#500-1000ms").on("click", async function () {
    console.log("500-1000ms filter");
    $(`#${$(".active")[1].getAttribute("id")}`).toggleClass("active");
    $("#500-1000ms").toggleClass("active");

    const nonFiltered = ipcRenderer.sendSync("get-proxies", {
      initial: false,
      group: currentgroup,
    });
    Object.values(nonFiltered).forEach((proxy) => {
      if (!(proxy.speed > 500 && proxy.speed <= 1000)) {
        delete nonFiltered[proxy.uuid];
      }
    });
    $("#proxy-tbody").empty();
    addProxiesToTable(nonFiltered, true);
  });

  $("#1000-2000ms").on("click", async function () {
    console.log("v2v filter");
    $(`#${$(".active")[1].getAttribute("id")}`).toggleClass("active");
    $("#1000-2000ms").toggleClass("active");
    const nonFiltered = ipcRenderer.sendSync("get-proxies", {
      initial: false,
      group: currentgroup,
    });
    Object.values(nonFiltered).forEach((proxy) => {
      if (!(proxy.speed > 1000 && proxy.speed <= 2000)) {
        delete nonFiltered[proxy.uuid];
      }
    });
    $("#proxy-tbody").empty();
    addProxiesToTable(nonFiltered, true);
  });

  $("#2000ms").on("click", async function () {
    console.log("bad filter");
    $(`#${$(".active")[1].getAttribute("id")}`).toggleClass("active");
    $("#2000ms").toggleClass("active");
    const nonFiltered = ipcRenderer.sendSync("get-proxies", {
      initial: false,
      group: currentgroup,
    });
    Object.values(nonFiltered).forEach((proxy) => {
      if (!(proxy.speed > 2000)) {
        delete nonFiltered[proxy.uuid];
      }
    });
    $("#proxy-tbody").empty();
    addProxiesToTale(nonFiltered, true);
  });

  Object.values(proxies).forEach((proxy) => {
    if (proxy.speed < 100) {
      sub100++;
    } else if (proxy.speed > 100 && proxy.speed <= 500) {
      one_to_five++;
    } else if (proxy.speed > 500 && proxy.speed <= 1000) {
      five_to_thou++;
    } else if (proxy.speed > 1000 && proxy.speed <= 2000) {
      thou_to_two++;
    } else if (proxy.speed > 2000) {
      two_plus++;
    }

    $("#proxy-tbody").append(`<tr id="${proxy.uuid}">
                <th style="text-align: center;border: 1px solid #1D1926;width: 50px;" scope="row"><input  type="checkbox" id="${proxy.uuid}_checkbox"></th>
                <td id="${proxy.uuid}-ip">${proxy.proxy}</td>
                <td id="${proxy.uuid}-speed-col"><i style="font-size: 10px;margin-right: 5px;" class="fas fa-circle"></i> <span class="health" id="${proxy.uuid}-speed"> ${proxy.speed}</span></td>
                <td id="proxy-site">   </td>
                <td><div class="text-white d-flex align-items-center justify-content-end ">
                    <span class="d-inline-flex align-items-center" style="font-size: 12px;margin-right: 5px;"><button class=" text-white p-0 border-0  bg-transparent" id="${proxy.uuid}-start"><span class="run icon-btn d-inline-block" id="${proxy.uuid}-run-span"></span>  </button> </span>
                    <span class="d-inline-flex align-items-center" style="font-size: 12px;"><button  class="text-white  p-0 border-0  bg-transparent" id="${proxy.uuid}-delete"><span class="delete-ic-r icon-btn d-inline-block"></span>  </button> </span>
                </div></td>
            </tr>`);

    if (proxy.speed < 100) {
      $(`#${proxy.uuid}-speed`).html(proxy.speed);
      $(`#${proxy.uuid}-speed-col`).addClass("green");
    } else if (proxy.speed > 100 && proxy.speed <= 500) {
      $(`#${proxy.uuid}-speed`).html(proxy.speed);
      $(`#${proxy.uuid}-speed-col`).addClass("orange lite-red");
    } else if (proxy.speed > 500 && proxy.speed <= 1000) {
      $(`#${proxy.uuid}-speed`).html(proxy.speed);
      $(`#${proxy.uuid}-speed-col`).addClass("orange");
    } else if (proxy.speed > 1000 && proxy.speed <= 2000) {
      $(`#${proxy.uuid}-speed`).html(proxy.speed);
      $(`#${proxy.uuid}-speed-col`).addClass("lite-red");
    } else if (proxy.speed > 2000) {
      $(`#${proxy.uuid}-speed`).html(proxy.speed);
      $(`#${proxy.uuid}-speed-col`).addClass("lite-red");
    }

    //RIGHT CLICK
    $(`#${proxy.uuid}`).on("contextmenu", function (event) {
      if (!$(`#${proxy.uuid}_checkbox`).prop("checked")) {
        const checked = $("input:checkbox:checked");
        for (const box of checked) {
          if (box.getAttribute("id") !== event.target.getAttribute("id")) {
            $(`#${box.getAttribute("id")}`).prop("checked", false);
          }
        }
        $(`#${proxy.uuid}_checkbox`).prop("checked", true);
      }
      console.log("he right click on", proxy.uuid);
      console.log(event);
      showCM(true);
      $(".custom-cm").css("top", event.pageY);
      $(".custom-cm").css("left", event.pageX);
    });

    //SELECTS proxy ON CLICK
    $(`#${proxy.uuid}`).on("click", async function (event) {
      if (event.target.getAttribute("id") !== `${proxy.uuid}_checkbox`) {
        const checked = $("input:checkbox:checked");
        for (const box of checked) {
          if (box.getAttribute("id") !== event.target.getAttribute("id")) {
            $(`#${box.getAttribute("id")}`).prop("checked", false);
          }
        }
        const ischecked = $(`#${proxy.uuid}_checkbox`).is(":checked");
        console.log(ischecked, "not", !ischecked);
        $(`#${proxy.uuid}_checkbox`).prop("checked", !ischecked);
      }
    });

    //DELETE THE proxy
    $(`#${proxy.uuid}-delete`).on("click", async function () {
      ipcRenderer.send("delete-proxy", {
        groupID: currentgroup,
        proxy: proxy.uuid,
      });

      $(`#${proxy.uuid}`).remove();
    });

    $("#100ms-filter").html(`${sub100}`);
    $("#100-500ms-filter").html(`${one_to_five}`);
    $("#500-1000ms-filter").html(`${five_to_thou}`);
    $("#1000-2000ms-filter").html(`${thou_to_two}`);
    $("#2000ms-filter").html(`${two_plus}`);
  });
};

////////////////////////////////////////
////////////////////////////////////////
//
// A D D     P R O X I E S
//
////////////////////////////////////////
////////////////////////////////////////

$("#new-proxy-submit").on("click", async function () {
  console.log("new proxies");
  console.log(document.getElementById("proxy-input").value.trim().split("\n"));
  ipcRenderer.send("add-proxies", {
    proxies: document.getElementById("proxy-input").value.trim().split("\n"),
    group: currentgroup,
  });
  document.getElementById("proxy-input").value = "";
});

$("#delete-all-currentgroup").on("click", async () => {
  ipcRenderer.send("delete-all-proxies", currentgroup);

  $("#proxy-tbody").empty();
  $("#allTask-text").text("0");
  $(`#${currentgroup}_stop_num`).text("0");
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

const start = async () => {
  console.log("started");
  $("#default").css("border", "1px solid #733fcc");
  const allProxies = ipcRenderer.sendSync("get-proxies", {
    initial: true,
    group: "default",
  });
  if (typeof allProxies.default.proxies !== {}) {
    console.log("proxies found");
    console.log("ALL PROXIES", allProxies);
    let number = Object.keys(allProxies.default.proxies).length;

    addProxiesToTable(allProxies.default.proxies);
    if (Object.keys(allProxies).length > 1) {
      for (const group in allProxies) {
        if (group !== "default") {
          console.log(group);
          addGrouptoList(
            allProxies[group].name,
            allProxies[group].uuid,
            Object.keys(allProxies[group].proxies).length
          );
        }
      }
    }

    //LISTENERS FOR THE GROUP ITSELF
  }

  $("#default").on("click", async (event) => {
    if (event.target.getAttribute("id").includes("edit")) {
      console.log("edit");
      jQuery("#groupEditModal").modal("show");
      $("#edited-group-name").value = name;
      $("#edit-group-submit").on("click", async () => {
        ipcRenderer.send("edit-proxy-group", {
          name: document.getElementById("edited-group-name").value,
          uuid: event.target.getAttribute("id").split("_")[0],
        });
        $(
          `#${event.target
            .getAttribute("id")
            .substring(0, event.target.getAttribute("id").length - 5)}_name`
        ).html(document.getElementById("edited-group-name").value);
        jQuery("#groupEditModal").modal("hide");
        $("#edit-group-submit").off("click");
      });
    } else if (event.target.getAttribute("id").includes("delete")) {
      console.log("delete da group");
      ipcRenderer.send(
        "delete-proxy-group",
        event.target.getAttribute("id").split("_")[0]
      );
      $(`#${event.target.getAttribute("id").split("_")[0]}`).remove();
    } else if (event.target.getAttribute("id") !== currentgroup) {
      // $('#proxy-filters').empty()
      $("#selectAll").prop("checked", false);
      $(`#${currentgroup}`).css("border", "");
      $(`#${event.target.getAttribute("id")}`).css(
        "border",
        "1px solid #733fcc"
      );

      currentgroup = event.target.getAttribute("id");
      const parsed = ipcRenderer.sendSync("get-proxies", {
        initial: false,
        group: event.target.getAttribute("id").includes("name")
          ? event.target.getAttribute("id").split("_")[0]
          : event.target.getAttribute("id"),
      });

      $("#proxy-tbody").empty();
      console.log(parsed);
      addProxiesToTable(parsed);
    }
  });
  $("#default_edit").on("click", (event) => {
    jQuery("#groupEditModal").modal("show");
    $("#edited-group-name").value = name;
    $("#edit-group-submit").on("click", async () => {
      ipcRenderer.send("edit-proxy-group", {
        name: document.getElementById("edited-group-name").value,
        uuid: event.target.getAttribute("id").split("_")[0],
      });
      $(
        `#${event.target
          .getAttribute("id")
          .substring(0, event.target.getAttribute("id").length - 5)}_name`
      ).html(document.getElementById("edited-group-name").value);
      jQuery("#groupEditModal").modal("hide");
      $("#edit-group-submit").off("click");
    });
  });
};

ipcRenderer.on("add-proxies-reply", (event, proxies) => {
  $("#allTask-text").html(
    parseInt($("#allTask-text").html()) + Object.values(proxies).length
  );
  Object.values(proxies).forEach((proxy) => {
    $("#proxy-tbody").append(`<tr id="${proxy.uuid}">
                    <th style="text-align: center;border: 1px solid #1D1926;width: 50px;" scope="row"><input  type="checkbox" id="${proxy.uuid}_checkbox"></th>
                    <td id="${proxy.uuid}-ip">${proxy.proxy}</td>
                    <td id="${proxy.uuid}-speed-col"><i style="font-size: 10px;margin-right: 5px;" class="fas fa-circle"></i> <span class="health" id="${proxy.uuid}-speed"> ${proxy.speed}</span></td>
                    <td id="proxy-site">   </td>
                    <td><div class="text-white d-flex align-items-center justify-content-end ">
                        <span class="d-inline-flex align-items-center" style="font-size: 12px;margin-right: 5px;"><button class=" text-white p-0 border-0  bg-transparent" id="${proxy.uuid}-start"><span class="run icon-btn d-inline-block" id="${proxy.uuid}-run-span"></span>  </button> </span>
                        <span class="d-inline-flex align-items-center" style="font-size: 12px;"><button  class="text-white  p-0 border-0  bg-transparent" id="${proxy.uuid}-delete"><span class="delete-ic-r icon-btn d-inline-block"></span>  </button> </span>
                    </div></td>
                </tr>`);

    $(`#${proxy.uuid}`).on("contextmenu", function (event) {
      if (!$(`#${proxy.uuid}_checkbox`).prop("checked")) {
        const checked = $("input:checkbox:checked");
        for (const box of checked) {
          if (box.getAttribute("id") !== event.target.getAttribute("id")) {
            $(`#${box.getAttribute("id")}`).prop("checked", false);
          }
        }
        $(`#${proxy.uuid}_checkbox`).prop("checked", true);
      }
      console.log("he right click on", proxy.uuid);
      showCM(true);
      $(".custom-cm").css("top", event.pageY);
      $(".custom-cm").css("left", event.pageX);
    });
    ////////////////////////////////////////
    ////////////////////////////////////////
    // C H E C K B O X    S T U F F
    ////////////////////////////////////////
    ////////////////////////////////////////
    $(`#${proxy.uuid}`).on("click", async function (event) {
      if (event.target.getAttribute("id") !== `${proxy.uuid}_checkbox`) {
        const checked = $("input:checkbox:checked");
        for (const box of checked) {
          if (box.getAttribute("id") !== event.target.getAttribute("id")) {
            $(`#${box.getAttribute("id")}`).prop("checked", false);
          }
        }
        const ischecked = $(`#${proxy.uuid}_checkbox`).is(":checked");
        console.log(ischecked, "not", !ischecked);
        $(`#${proxy.uuid}_checkbox`).prop("checked", !ischecked);
      }
    });
    ////////////////////////////////////////
    ////////////////////////////////////////
    // D E L E T E
    ////////////////////////////////////////
    ////////////////////////////////////////
    $(`#${proxy.uuid}-delete`).on("click", async function () {
      console.log("deleting proxy", proxy.uuid);
      ipcRenderer.send("delete-proxy", {
        groupID: currentgroup,
        proxy: proxy.uuid,
      });

      $(`#${proxy.uuid}`).remove();
      let ct = parseInt($("#allTask-text").text());
      $("#allTask-text").text(--ct);
    });
  });
});

start();
