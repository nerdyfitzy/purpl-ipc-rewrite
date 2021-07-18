const fs = require("fs");
const csv = require("csv-parser");
const { group } = require("console");
const { v4 } = require("uuid");

const abbrv = {
  AL: "Alabama",
  AK: "Alaska",
  AS: "American Samoa",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District Of Columbia",
  FM: "Federated States Of Micronesia",
  FL: "Florida",
  GA: "Georgia",
  GU: "Guam",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MH: "Marshall Islands",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  MP: "Northern Mariana Islands",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PW: "Palau",
  PA: "Pennsylvania",
  PR: "Puerto Rico",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VI: "Virgin Islands",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

const countries = {
  AF: "Afghanistan",
  AX: "Åland Islands",
  AL: "Albania",
  DZ: "Algeria",
  AS: "American Samoa",
  AD: "AndorrA",
  AO: "Angola",
  AI: "Anguilla",
  AQ: "Antarctica",
  AG: "Antigua and Barbuda",
  AR: "Argentina",
  AM: "Armenia",
  AW: "Aruba",
  AU: "Australia",
  AT: "Austria",
  AZ: "Azerbaijan",
  BS: "Bahamas",
  BH: "Bahrain",
  BD: "Bangladesh",
  BB: "Barbados",
  BY: "Belarus",
  BE: "Belgium",
  BZ: "Belize",
  BJ: "Benin",
  BM: "Bermuda",
  BT: "Bhutan",
  BO: "Bolivia",
  BA: "Bosnia and Herzegovina",
  BW: "Botswana",
  BV: "Bouvet Island",
  BR: "Brazil",
  IO: "British Indian Ocean Territory",
  BN: "Brunei Darussalam",
  BG: "Bulgaria",
  BF: "Burkina Faso",
  BI: "Burundi",
  KH: "Cambodia",
  CM: "Cameroon",
  CA: "Canada",
  CV: "Cape Verde",
  KY: "Cayman Islands",
  CF: "Central African Republic",
  TD: "Chad",
  CL: "Chile",
  CN: "China",
  CX: "Christmas Island",
  CC: "Cocos (Keeling) Islands",
  CO: "Colombia",
  KM: "Comoros",
  CG: "Congo",
  CD: "Congo, The Democratic Republic of the",
  CK: "Cook Islands",
  CR: "Costa Rica",
  CI: "Cote D'Ivoire",
  HR: "Croatia",
  CU: "Cuba",
  CY: "Cyprus",
  CZ: "Czech Republic",
  DK: "Denmark",
  DJ: "Djibouti",
  DM: "Dominica",
  DO: "Dominican Republic",
  EC: "Ecuador",
  EG: "Egypt",
  SV: "El Salvador",
  GQ: "Equatorial Guinea",
  ER: "Eritrea",
  EE: "Estonia",
  ET: "Ethiopia",
  FK: "Falkland Islands (Malvinas)",
  FO: "Faroe Islands",
  FJ: "Fiji",
  FI: "Finland",
  FR: "France",
  GF: "French Guiana",
  PF: "French Polynesia",
  TF: "French Southern Territories",
  GA: "Gabon",
  GM: "Gambia",
  GE: "Georgia",
  DE: "Germany",
  GH: "Ghana",
  GI: "Gibraltar",
  GR: "Greece",
  GL: "Greenland",
  GD: "Grenada",
  GP: "Guadeloupe",
  GU: "Guam",
  GT: "Guatemala",
  GG: "Guernsey",
  GN: "Guinea",
  GW: "Guinea-Bissau",
  GY: "Guyana",
  HT: "Haiti",
  HM: "Heard Island and Mcdonald Islands",
  VA: "Holy See (Vatican City State)",
  HN: "Honduras",
  HK: "Hong Kong",
  HU: "Hungary",
  IS: "Iceland",
  IN: "India",
  ID: "Indonesia",
  IR: "Iran, Islamic Republic Of",
  IQ: "Iraq",
  IE: "Ireland",
  IM: "Isle of Man",
  IL: "Israel",
  IT: "Italy",
  JM: "Jamaica",
  JP: "Japan",
  JE: "Jersey",
  JO: "Jordan",
  KZ: "Kazakhstan",
  KE: "Kenya",
  KI: "Kiribati",
  KP: "Korea, Democratic People'S Republic of",
  KR: "Korea, Republic of",
  KW: "Kuwait",
  KG: "Kyrgyzstan",
  LA: "Lao People'S Democratic Republic",
  LV: "Latvia",
  LB: "Lebanon",
  LS: "Lesotho",
  LR: "Liberia",
  LY: "Libyan Arab Jamahiriya",
  LI: "Liechtenstein",
  LT: "Lithuania",
  LU: "Luxembourg",
  MO: "Macao",
  MK: "Macedonia, The Former Yugoslav Republic of",
  MG: "Madagascar",
  MW: "Malawi",
  MY: "Malaysia",
  MV: "Maldives",
  ML: "Mali",
  MT: "Malta",
  MH: "Marshall Islands",
  MQ: "Martinique",
  MR: "Mauritania",
  MU: "Mauritius",
  YT: "Mayotte",
  MX: "Mexico",
  FM: "Micronesia, Federated States of",
  MD: "Moldova, Republic of",
  MC: "Monaco",
  MN: "Mongolia",
  MS: "Montserrat",
  MA: "Morocco",
  MZ: "Mozambique",
  MM: "Myanmar",
  NA: "Namibia",
  NR: "Nauru",
  NP: "Nepal",
  NL: "Netherlands",
  AN: "Netherlands Antilles",
  NC: "New Caledonia",
  NZ: "New Zealand",
  NI: "Nicaragua",
  NE: "Niger",
  NG: "Nigeria",
  NU: "Niue",
  NF: "Norfolk Island",
  MP: "Northern Mariana Islands",
  NO: "Norway",
  OM: "Oman",
  PK: "Pakistan",
  PW: "Palau",
  PS: "Palestinian Territory, Occupied",
  PA: "Panama",
  PG: "Papua New Guinea",
  PY: "Paraguay",
  PE: "Peru",
  PH: "Philippines",
  PN: "Pitcairn",
  PL: "Poland",
  PT: "Portugal",
  PR: "Puerto Rico",
  QA: "Qatar",
  RE: "Reunion",
  RO: "Romania",
  RU: "Russian Federation",
  RW: "RWANDA",
  SH: "Saint Helena",
  KN: "Saint Kitts and Nevis",
  LC: "Saint Lucia",
  PM: "Saint Pierre and Miquelon",
  VC: "Saint Vincent and the Grenadines",
  WS: "Samoa",
  SM: "San Marino",
  ST: "Sao Tome and Principe",
  SA: "Saudi Arabia",
  SN: "Senegal",
  CS: "Serbia and Montenegro",
  SC: "Seychelles",
  SL: "Sierra Leone",
  SG: "Singapore",
  SK: "Slovakia",
  SI: "Slovenia",
  SB: "Solomon Islands",
  SO: "Somalia",
  ZA: "South Africa",
  GS: "South Georgia and the South Sandwich Islands",
  ES: "Spain",
  LK: "Sri Lanka",
  SD: "Sudan",
  SR: "Suriname",
  SJ: "Svalbard and Jan Mayen",
  SZ: "Swaziland",
  SE: "Sweden",
  CH: "Switzerland",
  SY: "Syrian Arab Republic",
  TW: "Taiwan, Province of China",
  TJ: "Tajikistan",
  TZ: "Tanzania, United Republic of",
  TH: "Thailand",
  TL: "Timor-Leste",
  TG: "Togo",
  TK: "Tokelau",
  TO: "Tonga",
  TT: "Trinidad and Tobago",
  TN: "Tunisia",
  TR: "Turkey",
  TM: "Turkmenistan",
  TC: "Turks and Caicos Islands",
  TV: "Tuvalu",
  UG: "Uganda",
  UA: "Ukraine",
  AE: "United Arab Emirates",
  GB: "United Kingdom",
  US: "United States",
  UM: "United States Minor Outlying Islands",
  UY: "Uruguay",
  UZ: "Uzbekistan",
  VU: "Vanuatu",
  VE: "Venezuela",
  VN: "Viet Nam",
  VG: "Virgin Islands, British",
  VI: "Virgin Islands, U.S.",
  WF: "Wallis and Futuna",
  EH: "Western Sahara",
  YE: "Yemen",
  ZM: "Zambia",
  ZW: "Zimbabwe",
};

const profile = {
  profile_name: "name",
  email: "email",
  one_checkout: true,
  shipping: {
    name: "name",
    phone: "phone",
    addy1: "1",
    addy2: "2",
    addy3: "3",
    zip: "12345",
    city: "dallas",
    state: "texas",
    country: "united states",
  },
  sameBilling: false,
  billing: {
    name: "name",
    phone: "phone",
    addy1: "1",
    addy2: "2",
    addy3: "3",
    zip: "12345",
    city: "dallas",
    state: "texas",
    country: "united states",
  },
  payment: {
    name: "shomboolton goozeman",
    type: "MasterCard / Visa / American Express / Discover",
    cnb: "number",
    month: "mm",
    year: "yy",
    cvv: "cvv",
  },
};

const csv1 = (path, fn) => {
  const group = {};
  fs.createReadStream(path)
    .pipe(csv())
    .on("data", (row) => {
      const u = v4();
      group[u] = {
        profile_name: row["Profile Name"],
        uuid: u,
        email: row["Email Address"],
        one_checkout: true,
        shipping: {
          name: row["Shipping Name"],
          phone: row["Shipping Phone"],
          addy1: row["Shipping Address"],
          addy2: row["Shipping Address 2"],
          addy3: row["Shipping Address 3"],
          zip: row["Shipping Post Code"],
          city: row["Shipping City"],
          state: row["Shipping State"],
          country: row["Shipping Country"],
        },
        sameBilling: row["Same Billing/Shipping"],
        billing: {
          name: row["Billing Name"],
          phone: row["Billing Phone"],
          addy1: row["Billing Address"],
          addy2: row["Billing Address 2"],
          addy3: row["Billing Address 3"],
          zip: row["Billing Post Code"],
          city: row["Billing City"],
          state: row["Billing State"],
          country: row["Billing Country"],
        },
        payment: {
          name: row["Name on Card"],
          type: row["Card Type"],
          cnb: row["Card Number"],
          month: row["Expiration Month"],
          year: row["Expiration Year"],
          cvv: row["CVV"],
        },
      };
    })
    .on("end", () => {
      fs.writeFile("purpl.json", JSON.stringify(group), function (err) {
        if (err) throw new Error(err);
      });
      fn(group);
    });
};

const purpl = (path) => {
  let temp = fs.readFileSync(path);
  return JSON.parse(temp);
};

const aycd = (path) => {
  const group = {};
  let temp = fs.readFileSync(path);
  let parsed = JSON.parse(temp);
  for (const profile of parsed) {
    const u = v4();
    group[u] = {
      profile_name: profile.name,
      uuid: u,
      email: profile.shippingAddress.email,
      one_checkout: profile.onlyCheckoutOnce,
      shipping: {
        name: profile.shippingAddress.name,
        phone: profile.shippingAddress.phone,
        addy1: profile.shippingAddress.line1,
        addy2: profile.shippingAddress.line2,
        addy3: profile.shippingAddress.line3,
        zip: profile.shippingAddress.postCode,
        city: profile.shippingAddress.city,
        state: profile.shippingAddress.state,
        country: profile.shippingAddress.country,
      },
      sameBilling: profile.sameBillingAndShippingAddress,
      billing: {
        name: profile.billingAddress.name,
        phone: profile.billingAddress.phone,
        addy1: profile.billingAddress.line1,
        addy2: profile.billingAddress.line2,
        addy3: profile.billingAddress.line3,
        zip: profile.billingAddress.postCode,
        city: profile.billingAddress.city,
        state: profile.billingAddress.state,
        country: profile.billingAddress.country,
      },
      payment: {
        name: profile.paymentDetails.nameOnCard,
        type: profile.paymentDetails.cardType,
        cnb: profile.paymentDetails.cardNumber,
        month: profile.paymentDetails.cardExpMonth,
        year: profile.paymentDetails.cardExpYear.substring(1),
        cvv: profile.paymentDetails.cardCvv,
      },
    };
  }
  return group;
};

const balko = (path) => {
  const group = {};
  let temp = fs.readFileSync(path);
  let parsed = JSON.parse(temp).info;

  for (const profile of parsed) {
    const u = v4();
    group[u] = {
      profile_name: profile.id,
      uuid: u,
      email: profile.email,
      one_checkout: profile.oneCheckout,
      shipping: {
        name: profile.firstname + " " + profile.lastname,
        phone: profile.phone,
        addy1: profile.add1,
        addy2: profile.add2,
        addy3: "",
        zip: profile.zip,
        city: profile.city,
        state: profile.state,
        country: profile.country,
      },
      sameBilling: false,
      billing: {
        name: profile.firstname + " " + profile.lastname,
        phone: profile.phone,
        addy1: profile.add1,
        addy2: profile.add2,
        addy3: "",
        zip: profile.zip,
        city: profile.city,
        state: profile.state,
        country: profile.country,
      },
      payment: {
        name: profile.ccFirst + " " + profile.ccLast,
        cnb: profile.cc,
        month: profile.expm,
        year: profile.expy,
        cvv: profile.ccv,
      },
    };
    if (group[u].payment.cnb.charAt(0) === "4") {
      group[u].payment.type = "Visa";
    } else if (group[u].payment.cnb.charAt(0) === "5") {
      group[u].payment.type = "MasterCard";
    } else if (group[u].payment.cvv.length === 4) {
      group[u].payment.type = "American Express";
    } else {
      group[u].payment.type = "Discover";
    }
  }

  return group;
};

const cyber = (path) => {
  const group = {};
  let temp = fs.readFileSync(path);
  let parsed = JSON.parse(temp);

  for (const profile of parsed) {
    let u = v4();
    group[u] = {
      profile_name: profile.name,
      uuid: u,
      email: profile.email,
      one_checkout: profile.singleCheckout,
      shipping: {
        name: profile.delivery.firstName + " " + profile.delivery.lastName,
        phone: profile.phone,
        addy1: profile.delivery.address1,
        addy2: profile.delivery.address2,
        addy3: "",
        zip: profile.delivery.zip,
        city: profile.delivery.city,
        state: profile.delivery.state,
        country: profile.delivery.country,
      },
      sameBilling: profile.billingDifferent,
      billing: {
        name: profile.billing.firstName + " " + profile.billing.lastName,
        phone: profile.phone,
        addy1: profile.billing.address1,
        addy2: profile.billing.address2,
        addy3: "",
        zip: profile.billing.zip,
        city: profile.billing.city,
        state: profile.billing.state,
        country: profile.billing.country,
      },
      payment: {
        name: profile.billing.firstName + " " + profile.billing.lastName,
        cnb: profile.card.number,
        month: profile.card.expiryMonth,
        year: profile.card.expiryYear.substring(
          profile.card.expiryYear.length - 2
        ),
        cvv: profile.card.cvv,
      },
    };
    if (group[u].payment.cnb.charAt(0) === "4") {
      group[u].payment.type = "Visa";
    } else if (group[u].payment.cnb.charAt(0) === "5") {
      group[u].payment.type = "MasterCard";
    } else if (group[u].payment.cvv.length === 4) {
      group[u].payment.type = "American Express";
    } else {
      group[u].payment.type = "Discover";
    }
  }

  return group;
};

const wrath = (path) => {
  const group = {};
  let parsed = JSON.parse(fs.readFileSync(path));

  for (const profile of parsed) {
    const u = v4();
    group[u] = {
      profile_name: profile.name,
      uuid: u,
      email: profile.shippingAddress.email,
      one_checkout: profile.onlyCheckoutOnce,
      shipping: {
        name: profile.shippingAddress.name,
        phone: profile.shippingAddress.phone,
        addy1: profile.shippingAddress.line1,
        addy2: profile.shippingAddress.line2,
        addy3: profile.shippingAddress.line3,
        zip: profile.shippingAddress.postCode,
        city: profile.shippingAddress.city,
        state: abbrv[profile.shippingAddress.state],
        country: profile.shippingAddress.country,
      },
      sameBilling: profile.sameBillingAndShippingAddress,
      billing: {
        name: profile.billingAddress.name,
        phone: profile.billingAddress.phone,
        addy1: profile.billingAddress.line1,
        addy2: profile.billingAddress.line2,
        addy3: profile.billingAddress.line3,
        zip: profile.billingAddress.postCode,
        city: profile.billingAddress.city,
        state: abbrv[profile.billingAddress.state],
        country: profile.billingAddress.country,
      },
      payment: {
        name: profile.paymentDetails.nameOnCard,
        cnb: profile.paymentDetails.cardNumber,
        month: profile.paymentDetails.cardExpMonth,
        year: profile.paymentDetails.cardExpYear,
        cvv: profile.paymentDetails.cardCvv,
        type: profile.paymentDetails.cardType,
      },
    };

    if (group[u].payment.cnb.charAt(0) === "4") {
      group[u].payment.type = "Visa";
    } else if (group[u].payment.cnb.charAt(0) === "5") {
      group[u].payment.type = "MasterCard";
    } else if (group[u].payment.cvv.length === 4) {
      group[u].payment.type = "American Express";
    } else {
      group[u].payment.type = "Discover";
    }
  }
};

const dashe = (path) => {
  const group = {};
  let temp = fs.readFileSync(path);
  let parsed = JSON.parse(temp);
  let keys = Object.keys(parsed);
  let count = 0;

  for (const profile in parsed) {
    const u = v4();
    group[u] = {
      profile_name: keys[count],
      uuid: u,
      email: profile.email,
      one_checkout: false,
      shipping: {
        name: profile.shipping.firstName + " " + profile.shipping.lastName,
        phone: profile.shipping.phoneNumber,
        addy1: profile.shipping.address,
        addy2: profile.shipping.apt,
        addy3: "",
        zip: profile.shipping.zipCode,
        city: profile.shipping.city,
        state: profile.shipping.state,
        country: profile.shipping.country,
      },
      sameBilling: profile.billingMatch,
      billing: {
        name: profile.billing.firstName + " " + profile.billing.lastName,
        phone: profile.billing.phoneNumber,
        addy1: profile.billing.address,
        addy2: profile.billing.apt,
        addy3: "",
        zip: profile.billing.zipCode,
        city: profile.billing.city,
        state: profile.billing.state,
        country: profile.billing.country,
      },
      payment: {
        name: profile.card.holder,
        cnb: profile.card.number,
        month: profile.card.month,
        year: profile.card.year,
        cvv: profile.card.cvv,
      },
    };
    if (group[u].payment.cnb.charAt(0) === "4") {
      group[u].payment.type = "Visa";
    } else if (group[u].payment.cnb.charAt(0) === "5") {
      group[u].payment.type = "MasterCard";
    } else if (group[u].payment.cvv.length === 4) {
      group[u].payment.type = "American Express";
    } else {
      group[u].payment.type = "Discover";
    }

    count++;
  }

  return group;
};

const ganesh = (path) => {
  const group = {};
  fs.createReadStream(path)
    .pipe(csv())
    .on("data", (row) => {
      const u = v4();
      group[u] = {
        profile_name: `${row["FIRST NAME"]} ${row["LAST NAME"]} ${row[
          "CARD NUMBER"
        ].substring(row["CARD NUMBER"].length - 4)}`,
        email: row["EMAIL"],
        uuid: u,
        one_checkout: false,
        shipping: {
          name: row["FIRST NAME"] + " " + row["LAST NAME"],
          phone: row["LAST NAME"],
          addy1: row["ADDRESS LINE 1"],
          addy2: row["ADDRESS LINE 2"],
          addy3: "",
          zip: row["POSTCODE / ZIP"],
          city: row["CITY"],
          state: abbrv[row["Shipping State"]],
          country: usethis,
        },
        sameBilling: false,
        billing: {
          name: row["Billing First"] + " " + row["Billing Last"],
          phone: row["PHONE NUMBER"],
          addy1: row["Billing Street1"],
          addy2: row["Billing Street2"],
          addy3: "",
          zip: row["Billing Zip"],
          city: row["Billing City"],
          state: abbrv[row["Billing State"]],
          country: row[countries],
        },
        payment: {
          name: row["FIRST NAME"] + " " + row["LAST NAME"],
          cnb: row["CARD NUMBER"],
          month: row["EXPIRE MONTH"],
          year: row["EXPIRE YEAR"],
          cvv: row["CARD CVC"],
        },
      };

      if (group[u].payment.cnb.charAt(0) === "4") {
        group[u].payment.type = "Visa";
      } else if (group[u].payment.cnb.charAt(0) === "5") {
        group[u].payment.type = "MasterCard";
      } else if (group[u].payment.cvv.length === 4) {
        group[u].payment.type = "American Express";
      } else {
        group[u].payment.type = "Discover";
      }
    })
    .on("end", () => {
      return group;
    });
};

const kodai = (path) => {
  const group = {};
  let temp = fs.readFileSync(path);
  let parsed = JSON.parse(temp);

  for (const profile in parsed) {
    const u = v4();
    group[u] = {
      profile_name: profile.profileName,
      uuid: u,
      email: profile.paymentDetails.emailAddress,
      one_checkout: false,
      shipping: {
        name:
          profile.deliveryAddress.firstName +
          " " +
          profile.deliveryAddress.lastName,
        phone: profile.deliveryAddress.phoneNumber,
        addy1: profile.deliveryAddress.address,
        addy2: profile.deliveryAddress.apt,
        addy3: "",
        zip: profile.deliveryAddress.zipCode,
        city: profile.deliveryAddress.city,
        state: profile.deliveryAddress.state,
        country: profile.region,
      },
      sameBilling: profile.miscellaneousInformation.deliverySameAsBilling,
      billing: {
        name:
          profile.billingAddress.firstName +
          " " +
          profile.billingAddress.lastName,
        phone: profile.billingAddress.phoneNumber,
        addy1: profile.billingAddress.address,
        addy2: profile.billingAddress.apt,
        addy3: "",
        zip: profile.billingAddress.zipCode,
        city: profile.billingAddress.city,
        state: profile.billingAddress.state,
        country: profile.region,
      },
      payment: {
        name: profile.paymentDetails.cardHolder,
        cnb: profile.paymentDetails.cardNumber,
        month: profile.paymentDetails.expirationDate.split("/")[0],
        year: "20" + profile.paymentDetails.expirationDate.split("/")[1],
        cvv: profile.paymentDetails.cvv,
      },
    };
    if (group[u].payment.cnb.charAt(0) === "4") {
      group[u].payment.type = "Visa";
    } else if (group[u].payment.cnb.charAt(0) === "5") {
      group[u].payment.type = "MasterCard";
    } else if (group[u].payment.cvv.length === 4) {
      group[u].payment.type = "American Express";
    } else {
      group[u].payment.type = "Discover";
    }
  }

  return group;
};

const kage = (path) => {
  fs.createReadStream(path)
    .pipe(csv())
    .on("data", (row) => {
      let u = v4();
      group[u] = {
        profile_name: row[Profile],
        uuid: u,
        email: row[ProfileEmail],
        one_checkout: false,
        shipping: {
          name: row["First Name"] + " " + row["Last Name"],
          phone: row["Phone Number"],
          addy1: row["Shipping Street1"],
          addy2: row["Shipping Street2"],
          addy3: "",
          zip: row["Shipping Zip"],
          city: row["Shipping City"],
          state: abbrv[row["STATE"]],
          country: usethis,
        },
        sameBilling: true,
        billing: {
          name: row["Billing First"] + " " + row["Billing Last"],
          phone: row["Phone Number"],
          addy1: row["Billing Street1"],
          addy2: row["Billing Street2"],
          addy3: "",
          zip: row["Billing Zip"],
          city: row["Billing City"],
          state: abbrv[row["Billing State"]],
          country: countries[row["Country"]],
        },
        payment: {
          name: row["Billing First"] + " " + row["Billing Last"],
          cnb: row["Card Number"],
          month: row["Card Month"],
          year: row["Card Year"],
          cvv: row["Card CVV"],
        },
      };

      if (group[u].payment.cnb.charAt(0) === "4") {
        group[u].payment.type = "Visa";
      } else if (group[u].payment.cnb.charAt(0) === "5") {
        group[u].payment.type = "MasterCard";
      } else if (group[u].payment.cvv.length === 4) {
        group[u].payment.type = "American Express";
      } else {
        group[u].payment.type = "Discover";
      }
    })
    .on("end", () => {
      return group;
    });
};

const mekpreme = (path) => {
  const group = {};
  let temp = fs.readFileSync(path);
  let parsed = JSON.parse(temp);
};

const nsb = (path) => {
  const group = {};
  let temp = fs.readFileSync(path);
  let parsed = JSON.parse(temp);
  for (const prof of parsed) {
    let u = v4();
    group[u] = {
      profile_name: prof.name,
      email: prof.email,
      uuid: u,
      one_checkout: false,
      shipping: {
        name: prof.shipping.firstname + " " + prof.shipping.lastname,
        phone: prof.shipping.phone,
        addy1: prof.shipping.address,
        addy2: prof.shipping.address2,
        addy3: "",
        zip: prof.shipping.zip,
        city: prof.shipping.city,
        state: prof.shipping.state,
        country: countries[prof.shipping.country],
      },
      sameBilling: prof.billingSame,
      billing: {
        name: prof.billing.firstname + " " + prof.billing.lastname,
        phone: prof.billing.phone,
        addy1: prof.billing.address,
        addy2: prof.billing.address2,
        addy3: "",
        zip: prof.billing.zip,
        city: prof.billing.city,
        state: abbrv[prof.billing.state],
        country: countries[prof.billing.country],
      },
      payment: {
        name: prof.cc.name,
        cnb: prof.cc.number,
        month: prof.cc.expiry.substring(0, 2),
        year: prof.cc.substring(4),
        cvv: prof.cc.cvc,
      },
    };

    if (group[u].payment.cnb.charAt(0) === "4") {
      group[u].payment.type = "Visa";
    } else if (group[u].payment.cnb.charAt(0) === "5") {
      group[u].payment.type = "MasterCard";
    } else if (group[u].payment.cvv.length === 4) {
      group[u].payment.type = "American Express";
    } else {
      group[u].payment.type = "Discover";
    }
  }

  return group;
};

const phantom = (path) => {
  const group = {};
  let temp = fs.readFileSync(path);
  let parsed = JSON.parse(temp);

  for (const prof of parsed) {
    let u = v4();
    group[u] = {
      profile_name: prof.Name,
      email: prof.Email,
      uuid: u,
      one_checkout: prof.limit,
      shipping: {
        name: prof.Shipping.FirstName + " " + prof.Shipping.FirstName,
        phone: prof.Phone,
        addy1: prof.Shipping.Address,
        addy2: prof.Shipping.Apt,
        addy3: "",
        zip: prof.Shipping.Zip,
        city: prof.Shipping.City,
        state: abbrv[prof.Shipping.State],
        country: countries[prof.Shipping.country],
      },
      sameBilling: prof.Same,
      billing: {
        name: prof.Billing.FirstName + " " + prof.Billing.LastName,
        phone: prof.Phone,
        addy1: prof.Billing.Address,
        addy2: prof.Billing.Apt,
        addy3: "",
        zip: prof.Billing.Zip,
        city: prof.Billing.City,
        state: abbrv[prof.Billing.State],
        country: countries[prof.Billing.country],
      },
      payment: {
        name: prof.card.name,
        cnb: prof.CCNumber,
        month: prof.ExpMonth,
        year: prof.ExpYear,
        cvv: prof.CVV,
      },
    };
    if (group[u].payment.cnb.charAt(0) === "4") {
      group[u].payment.type = "Visa";
    } else if (group[u].payment.cnb.charAt(0) === "5") {
      group[u].payment.type = "MasterCard";
    } else if (group[u].payment.cvv.length === 4) {
      group[u].payment.type = "American Express";
    } else {
      group[u].payment.type = "Discover";
    }
  }

  return group;
};

const polaris = (path) => {
  const group = {};
  let temp = fs.readFileSync(path);
  let parsed = JSON.parse(temp);

  for (const prof of parsed) {
    group[prof.uuid] = {
      profile_name: prof.name,
      email: prof.email,
      one_checkout: prof.sameAddress,
      uuid: u,
      shipping: {
        name: prof.shipping.first_name + " " + prof.shipping.last_name,
        phone: prof.shipping.phone,
        addy1: prof.shipping.address_line_1,
        addy2: prof.shipping.address_line_2,
        addy3: "",
        zip: prof.shipping.zipcode,
        city: prof.shipping.city,
        state: prof.shipping.state.label,
        country: prof.shipping.country.label,
      },
      sameBilling: prof.Same,
      billing: {
        name: prof.billing.first_name + " " + prof.billing.last_name,
        phone: prof.billing.phone,
        addy1: prof.billing.address_line_1,
        addy2: prof.billing.address_line_2,
        addy3: "",
        zip: prof.billing.zipcode,
        city: prof.billing.city,
        state: prof.billing.state.label,
        country: prof.billing.country.label,
      },
      payment: {
        name: prof.card.name,
        cnb: prof.card.number,
        month: prof.expiry.month.label,
        year: prof.expiry.year.label,
        cvv: prof.card.cvv,
      },
    };
    if (group[prof.uuid].payment.cnb.charAt(0) === "4") {
      group[prof.uuid].payment.type = "Visa";
    } else if (group[prof.uuid].payment.cnb.charAt(0) === "5") {
      group[prof.uuid].payment.type = "MasterCard";
    } else if (group[prof.uuid].payment.cvv.length === 4) {
      group[prof.uuid].payment.type = "American Express";
    } else {
      group[prof.uuid].payment.type = "Discover";
    }
  }

  return group;
};

const prism = (path) => {
  const group = {};
  let temp = fs.readFileSync(path);
  let parsed = JSON.parse(temp);

  for (const prof of parsed) {
    let u = v();
    group[u] = {
      profile_name: prof.name,
      email: prof.email,
      uuid: u,
      one_checkout: prof.oneTimeUse,
      shipping: {
        name: prof.shipping.firstName + " " + prof.shipping.lastName,
        phone: prof.shipping.phone,
        addy1: prof.shipping.address1,
        addy2: prof.shipping.address2,
        addy3: "",
        zip: prof.shipping.zipcode,
        city: prof.shipping.city,
        state: prof.shipping.province,
        country: prof.shipping.country,
      },
      sameBilling: prof.billing.sameAsShipping,
      payment: {
        name: prof.payment.name,
        cnb: prof.payment.num,
        month: prof.payment.month.label,
        year: prof.payment.year.substring(2),
        cvv: prof.payment.cvv,
      },
    };
    if (prof.billing.sameAsShipping) {
      group[u].billing = {
        name: prof.shipping.firstName + " " + prof.shipping.lastName,
        phone: prof.shipping.phone,
        addy1: prof.shipping.address1,
        addy2: prof.shipping.address2,
        addy3: "",
        zip: prof.shipping.zipcode,
        city: prof.shipping.city,
        state: prof.shipping.province,
        country: prof.shipping.country,
      };
    } else {
      group[u].billing = {
        name: prof.billing.first_name + " " + prof.billing.last_name,
        phone: prof.billing.phone,
        addy1: prof.billing.address_line_1,
        addy2: prof.billing.address_line_2,
        addy3: "",
        zip: prof.billing.zipcode,
        city: prof.billing.city,
        state: prof.billing.state.label,
        country: prof.billing.country.label,
      };
    }

    if (group[u].payment.cnb.charAt(0) === "4") {
      group[u].payment.type = "Visa";
    } else if (group[u].payment.cnb.charAt(0) === "5") {
      group[u].payment.type = "MasterCard";
    } else if (group[u].payment.cvv.length === 4) {
      group[u].payment.type = "American Express";
    } else {
      group[u].payment.type = "Discover";
    }
  }

  return group;
};

const pd = (path) => {
  const group = {};
  let temp = fs.readFileSync(path);
  let parsed = JSON.parse(temp);

  for (const prof of parsed) {
    let u = v4();
    group[u] = {
      profile_name: prof.title,
      email: prof.email,
      one_checkout: prof.limit,
      shipping: {
        name: prof.shipping.firstName + " " + prof.shipping.lastName,
        phone: prof.shipping.phone,
        addy1: prof.shipping.address1,
        addy2: prof.shipping.address2,
        addy3: "",
        zip: prof.shipping.zipcode,
        city: prof.shipping.city,
        state: prof.shipping.state,
        country: prof.shipping.country,
      },
      sameBilling: prof.match,
      billing: {
        name: prof.billing.firstName + " " + prof.billing.lastName,
        phone: prof.billing.phone,
        addy1: prof.billing.address1,
        addy2: prof.billing.address2,
        addy3: "",
        zip: prof.billing.zipcode,
        city: prof.billing.city,
        state: prof.billing.state,
        country: prof.billing.country,
      },
      payment: {
        name: prof.card.name,
        cnb: prof.card.number.replace(" ", ""),
        month: prof.card.expiry.split("/")[0],
        year: prof.card.split("/")[1],
        cvv: prof.card.code,
      },
    };
    if (group[u].payment.cnb.charAt(0) === "4") {
      group[u].payment.type = "Visa";
    } else if (group[u].payment.cnb.charAt(0) === "5") {
      group[u].payment.type = "MasterCard";
    } else if (group[u].payment.cvv.length === 4) {
      group[u].payment.type = "American Express";
    } else {
      group[u].payment.type = "Discover";
    }
  }

  return group;
};

const nebula = (path) => {
  const group = {};
  let temp = fs.readFileSync(path);
  let parsed = JSON.parse(temp);

  for (const prof of parsed) {
    const u = v4();
    group[u] = {
      profile_name: prof.name,
      email: prof.email,
      one_checkout: prof.limit,
      shipping: {
        name: prof.shipping.name,
        phone: prof.shipping.phone,
        addy1: prof.shipping.address,
        addy2: prof.shipping.apt,
        addy3: "",
        zip: prof.shipping.zip,
        city: prof.shipping.city,
        state: prof.shipping.province.label,
        country: prof.shipping.country.label,
      },
      sameBilling: prof.matches,
      billing: {
        name: prof.billing.name,
        phone: prof.billing.phone,
        addy1: prof.billing.address,
        addy2: prof.billing.apt,
        addy3: "",
        zip: prof.billing.zip,
        city: prof.billing.city,
        state: prof.billing.province.label,
        country: prof.billing.country.label,
      },
      payment: {
        name: prof.payment.holder,
        cnb: prof.payment.card,
        month: prof.payment.exp.split("/")[0],
        year: prof.payment.exp.split("/")[1],
        cvv: prof.payment.cvv,
      },
    };
    if (group[u].payment.cnb.charAt(0) === "4") {
      group[u].payment.type = "Visa";
    } else if (group[u].payment.cnb.charAt(0) === "5") {
      group[u].payment.type = "MasterCard";
    } else if (group[u].payment.cvv.length === 4) {
      group[u].payment.type = "American Express";
    } else {
      group[u].payment.type = "Discover";
    }
  }

  return group;
};

const sole = () => {
  const group = {};
  let temp = fs.readFileSync(path);
  let parsed = JSON.parse(temp);
};

const splashforce = () => {
  const group = {};
  let temp = fs.readFileSync(path);
  let parsed = JSON.parse(temp);
};

const tks = () => {
  const group = {};
  let temp = fs.readFileSync(path);
  let parsed = JSON.parse(temp);
};

const tohru = () => {
  const group = {};
  let temp = fs.readFileSync(path);
  let parsed = JSON.parse(temp);
};

module.exports = {
  pd: pd,
  cyber: cyber,
  dashe: dashe,
  kodai: kodai,
  phantom: phantom,
  csv1: csv1,
  purpl: purpl,
  aycd: aycd,
  balko: balko,
  ganesh: ganesh,
  kage: kage,
  nsb: nsb,
  polaris: polaris,
  prism: prism,
  nebula: nebula,
  wrath,
};
