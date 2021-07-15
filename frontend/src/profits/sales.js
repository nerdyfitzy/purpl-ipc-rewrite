const { ipcRenderer, remote } = require("electron");
const path = require("path");
const $ = require("jquery");

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
    <td>
        <span class="f-16"
        ><img
            src="../../assets/images/stock.svg"
            class="me-1"
            alt=""
        />
        Stockx</span
        >
    </td>
    <td>
    <span class="f-16">Sold</span>
        </td>
        <td>1/21/2021</td>
        <td>
            <div class="fw-bold f-16">$${item.prices.price}</div>
        </td>
        <td>
            <div class="fw-bold f-16">$${item.prices.listingAmount}</div>
        </td>
        <td id="${uuid}_profit">
            
        </td>
    </tr>`;
  $("table tbody").append(added);
  if (item.prices.profit > 0) {
    $(`#${uuid}_profit`).append(`<div class="f-16 fw-bold up-color">
        <img src="../../assets/images/up-index.svg" alt="" />
        $${item.prices.profit}
        </div>`);
  } else {
    $(`#${uuid}_profit`).append(`<div class="f-16 fw-bold down-color">
        <img src="../../assets/images/down-index.svg" alt="" />
        $${item.prices.profit}
        </div>`);
  }
};

$("#close-button").on("click", async function () {
  const win = remote.getCurrentWindow();
  win.close();
});

$("#minimize-button").on("click", async function () {
  const win = remote.getCurrentWindow();
  win.minimize();
});

var asd = setInterval(() => {
  if (!$("#exampleModal").is(":visible")) {
    console.log("empything");
    $("#inventory").empty();
  }
}, 3000);

$("#sale-submit").on("click", () => {
  $("#inventory").empty();
  const item = ipcRenderer.sendSync("new-sale", {
    item: $("#inventory").val(),
    price: parseInt($("#sale-price").val()),
    shipping: parseInt($("#shipping").val()),
    platform: $("#platform").val(),
    date: $("#date-input").val(),
  });
  addItemToTable(item);
});

$("#mark-sold-modal").on("click", () => {
  const inventory = ipcRenderer.sendSync("load-inventory", false);
  for (const item in inventory) {
    $("#inventory").append(
      `<option value="${item}" id="${item}">${inventory[item].name} // ${inventory[item].color}</option>`
    );
  }
});

const start = async () => {
  const parsed = ipcRenderer.sendSync("load-sales", true);
  $("#sales-profit").text(
    `$${Object.values(parsed).reduce(total, (item) => {
      return (total += item.prices.profit);
    })}`
  );
  $("#total-sales").text(Object.values(parsed).length.toString());
  Object.values(parsed).forEach((item) => {
    addItemToTable(item);
  });
};

start();
