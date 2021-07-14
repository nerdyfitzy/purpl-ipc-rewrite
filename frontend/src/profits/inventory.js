const { ipcRenderer, remote } = require("electron");
const path = require("path");
const $ = require("jquery");

//date formatter
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

$("#item-name-input").on("keyup", async () => {
  const input = $("#item-name-input").val();
  if (
    input.charAt(input.length - 1) === " " &&
    input.charAt(input.length - 2) !== " "
  ) {
    $("#suggestions").empty();
    ipcRenderer.send("stockx-search", input);
  }
});

$("#login-stockx").on("click", async () => {
  console.log("login stockx");
  ipcRenderer.send("stockx-login");
});

$("#new-item-submit").on("click", async () => {
  const parsed = ipcRenderer.sendSync("add-inventory", {
    sku: $("#sku-input").val(),
    size: $("#sizing-input").val(),
    price:
      parseInt($("#price-input").val()) +
      parseInt($("#tax-input").val()) +
      parseInt($("#shipping-input").val()),
    store: $("#store-input").val(),
    order: $("#order-input").val(),
    date: $("#date-input").val(),
    tags: $("#tags-input").val() || [$("#sku-input").val()],
  });

  addItemToTable(parsed);
});

const addItemToTable = async (item) => {
  let cur = parseInt($("#total-product").text());
  $("#total-product").text(++cur);
  const { uuid, name, img, size, color, status } = item;
  const added = `<tr id="${uuid}">
    <td>
      <input style="background: #393642" type="checkbox" id="${uuid}_box"/>
    </td>
    <td>
      <div class="d-flex align-items-center">
        <div>
          <img
            style="width: 40px; height: 40px"
            src="${img}"
            alt=""
          />
        </div>
        <div class="ms-3">
          <h2 class="mb-1 f-16">${name}</h2>
        </div>
      </div>
    </td>
    <td>
      <span class="f-16">${size}</span>
    </td>
    <td>
      <span class="f-16">${color}</span>
    </td>
    <td id="${uuid}_platform">
        
    </td>
    <td>
      <span class="f-16">${status}</span>
    </td>
    <td>${item.generalInfo.dateReadable}</td>
    <td>
      <div class="fw-bold f-16">$${item.generalInfo.price}</div>
    </td>
    <td>
      <div class="fw-bold f-16" id="${uuid}_value">$${item.market.value}</div>
    </td>
    <td>
      <div class="f-16 fw-bold up-color" id="${uuid}_unreal">
        <img src="../../assets/images/up-index.svg" alt=""/> $${item.market.unrealized}
      </div>
    </td>
  </tr>`;

  $("table tbody").append(added);
  //    todo: add goat and change this to be variable
  if (status === "Listed") {
    $(`${uuid}_platform`).append(`<span class="f-16">
        <img src="../../assets/images/stock.svg" class="me-1" alt=""/>
    StockX</span>`);
  }
};

$("#refresh").on("click", async () => {
  ipcRenderer.send("refresh-market");
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
  const parsedInitial = ipcRenderer.sendSync("load-inventory", true);
  console.log(parsedInitial);
  if (parsedInitial !== "undefined") {
    $("#total-product").text(Object.values(parsedInitial).length.toString());
    $("#unreal-profit").text(
      `$${Math.round(
        Object.values(parsedInitial).reduce((total, item) => {
          if (item.market.unrealized) {
            return (total += item.market.unrealized);
          }
        }, 0)
      )}`
    );
    Object.values(parsedInitial).forEach((item) => {
      addItemToTable(item);
    });
  }
};

start();

ipcRenderer.on("stockx-search-reply", (event, parsed) => {
  parsed.filter((hit) => hit.name.toLowerCase().includes(input.toLowerCase()));

  parsed.forEach((item) => {
    $("#suggestions").append(
      `<div style="height: 75px" id="${item.sku}"><img src="${item.img}"></img>${item.name}</div>`
    );

    $(`#${item.sku}`).on("click", () => {
      const splitted = item.release.split("-");
      document.getElementById("sku-input").value = item.sku;
      document.getElementById("price-input").value = item.price;
      document.getElementById(
        "date-input"
      ).value = `${splitted[1]}/${splitted[2]}/${splitted[0]}`;
      if (item.product_category === "sneakers") {
        $("#sizing-input").append(`
            <option value="4">4</option>
            <option value="4.5">4.5</option>
            <option value="5">5</option>
            <option value="5.5">5.5</option>
            <option value="6">6</option>
            <option value="6.5">6.5</option>
            <option value="7">7</option>
            <option value="7.5">7.5</option>
            <option value="8">8</option>
            <option value="8.5">8.5</option>
            <option value="9">9</option>
            <option value="9.5">9.5</option>
            <option value="10">10</option>
            <option value="10.5">10.5</option>
            <option value="11">11</option>
            <option value="11.5">11.5</option>
            <option value="12">12</option>
            <option value="12.5">12.5</option>
            <option value="13">13</option>
            <option value="13.5">13.5</option>
            <option value="14">14</option>
            `);
      } else if (item.product_category === "streetwear") {
        $("#sizing-input").append(`
            <option value="XXS">XXS</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          `);
      } else {
        console.log(item.product_category);
        $("#sizing-input").append(`
            <option value="4">4</option>
            <option value="4.5">4.5</option>
            <option value="5">5</option>
            <option value="5.5">5.5</option>
            <option value="6">6</option>
            <option value="6.5">6.5</option>
            <option value="7">7</option>
            <option value="7.5">7.5</option>
            <option value="8">8</option>
            <option value="8.5">8.5</option>
            <option value="9">9</option>
            <option value="9.5">9.5</option>
            <option value="10">10</option>
            <option value="10.5">10.5</option>
            <option value="11">11</option>
            <option value="11.5">11.5</option>
            <option value="12">12</option>
            <option value="12.5">12.5</option>
            <option value="13">13</option>
            <option value="13.5">13.5</option>
            <option value="14">14</option>
            `);
      }
    });
  });
});

ipcRenderer.on("refresh-market-reply", (event, inv) => {
  Object.values(inv).forEach((item) => {
    console.log("NEW VALUES", item.market.value, item.market.unrealized);
    $(`#${item.uuid}_value`).text(`$${item.market.value}`);
    $(`#${item.uuid}_unreal`).text(`$${item.market.unrealized}`);
  });

  $("#unreal-profit").text(
    `$${Math.round(
      Object.values(inv).reduce((total, item) => {
        if (item.market.unrealized) {
          return (total += item.market.unrealized);
        }
      }, 0)
    )}`
  );
});
