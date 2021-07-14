const { ipcRenderer, remote } = require("electron");
const path = require("path");
const $ = require("jquery");

var date = document.getElementById("date-input");

function checkValue(str, max) {
  if (str.charAt(0) !== "0" || str == "00") {
    var num = parseInt(str);
    if (isNaN(num) || num <= 0 || num > max) num = 1;
    str =
      num > parseInt(max.toString().charAt(0)) && num.toString().length == 1
        ? "0" + num
        : num.toString();
  }
  return str;
}

date.addEventListener("input", function (e) {
  this.type = "text";
  var input = this.value;
  if (/\D\/$/.test(input)) input = input.substr(0, input.length - 3);
  var values = input.split("/").map(function (v) {
    return v.replace(/\D/g, "");
  });
  if (values[0]) values[0] = checkValue(values[0], 12);
  if (values[1]) values[1] = checkValue(values[1], 31);
  var output = values.map(function (v, i) {
    return v.length == 2 && i < 2 ? v + " / " : v;
  });
  this.value = output.join("").substr(0, 14);
});

date.addEventListener("blur", function (e) {
  this.type = "text";
  var input = this.value;
  var values = input.split("/").map(function (v, i) {
    return v.replace(/\D/g, "");
  });
  var output = "";

  if (values.length == 3) {
    var year =
      values[2].length !== 4 ? parseInt(values[2]) + 2000 : parseInt(values[2]);
    var month = parseInt(values[0]) - 1;
    var day = parseInt(values[1]);
    var d = new Date(year, month, day);
    if (!isNaN(d)) {
      document.getElementById("result").innerText = d.toString();
      var dates = [d.getMonth() + 1, d.getDate(), d.getFullYear()];
      output = dates
        .map(function (v) {
          v = v.toString();
          return v.length == 1 ? "0" + v : v;
        })
        .join(" / ");
    }
  }
  this.value = output;
});
$(".recurring").css("display", "none");
$("#recurring-ex").on("change", function () {
  console.log("changed to", this.value);
  if (this.value === "true") {
    $(".recurring").css("display", "block");
  } else {
    $(".recurring").css("display", "none");
  }
});

const addItemToTable = async (
  uuid,
  name,
  type,
  qty,
  store,
  date,
  price,
  tax,
  shipping
) => {
  const added = `<tr id="${parsedMsg.uuid}">
    <td>
      <input style="background: #393642" type="checkbox" id="${parsedMsg.uuid}-box"/>
    </td>
    <td>
      <div class="d-flex align-items-center">
        <div>
          <img
            style="width: 40px; height: 40px"
            src="../../assets/images/product_name.svg"
            alt=""
          />
        </div>
        <div class="ms-3">
          <h2 class="mb-1 f-16" id="${parsedMsg.uuid}-name">${parsedMsg.name}</h2>
        </div>
      </div>
    </td>
    <td>
      <span class="f-16" id="${parsedMsg.uuid}-type">${parsedMsg.type}</span>
    </td>
    <td>
      <span class="f-16" id="${parsedMsg.uuid}-qty">${parsedMsg.qty}</span>
    </td>
    <td>
      <span class="f-16" id="${parsedMsg.uuid}-store">
        ${parsedMsg.store}</span
      >
    </td>
    <td id="${parsedMsg.uuid}-date">${parsedMsg.date}</td>
    <td>
      <span class="f-16" id="${parsedMsg.uuid}-price">$${parsedMsg.price}</span>
    </td>
    <td>
      <div class="fw-bold f-16" id="${parsedMsg.uuid}-tax">$${parsedMsg.tax}</div>
    </td>
    <td>
      <div class="fw-bold f-16" id="${parsedMsg.uuid}-shipping">$${parsedMsg.shipping}</div>
    </td>
  </tr>`;
  let total = parseInt($("#tot-expenses").val());
  $("#tot-expenses").text(++total);
  $("table tbody").append(added);
};

$("#ex-submit").on("click", async () => {
  const price =
    (document.getElementById("ex-price").value
      ? parseInt(document.getElementById("ex-price").value)
      : 0) *
    (document.getElementById("ex-qty").value
      ? parseInt(document.getElementById("ex-qty").value)
      : 0);

  const tax = document.getElementById("tax-cost").value
    ? parseInt(document.getElementById("tax-cost").value)
    : 0;

  const shipping = document.getElementById("shipping-cost").value
    ? parseInt(document.getElementById("shipping-cost").value)
    : 0;

  const parsedMsg = ipcRenderer.sendSync("add-expense", {
    price: document.getElementById("ex-price").value
      ? parseInt(document.getElementById("ex-price").value)
      : 0,
    tax: document.getElementById("tax-cost").value
      ? parseInt(document.getElementById("tax-cost").value)
      : 0,
    shipping: document.getElementById("shipping-cost").value
      ? parseInt(document.getElementById("shipping-cost").value)
      : 0,
    name: document.getElementById("ex-name").value,
    type: document.getElementById("ex-type").value,
    qty: document.getElementById("ex-qty").value,
    price,
    tax,
    shipping,
    store: document.getElementById("store-ex").value,
    date: document.getElementById("date-input").value,
  });
  console.log(parsedMsg);
  addItemToTable(parsedMsg);
});

$("#close-button").on("click", async function () {
  const win = remote.getCurrentWindow();
  win.close();
});

$("#minimize-button").on("click", async function () {
  const win = remote.getCurrentWindow();
  win.minimize();
});

const start = async () => {
  const parsedInitial = ipcRenderer.sendSync("get-expenses", true);

  console.log(parsedInitial);
  if (parsedInitial) {
    $("#tot-expenses").text(Object.values(parsedInitial).length.toString());
    $("#tot-spent").text(
      `$${Math.round(
        Object.values(parsedInitial).reduce(
          (total, item) => (total += item.price),
          0
        )
      )}`
    );
    Object.values(parsedInitial).forEach((item) => {
      addItemToTable(item);
    });
  }
};

start();
