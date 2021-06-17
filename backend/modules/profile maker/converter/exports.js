const fs = require('fs');
const csv = require('csv-parser');
const { group, info } = require('console');
const {v4} = require('uuid')

const abbrv = {
    Alabama: 'AL',
    Alaska: 'AK',
    'American Samoa': 'AS',
    Arizona: 'AZ',
    Arkansas: 'AR',
    California: 'CA',
    Colorado: 'CO',
    Connecticut: 'CT',
    Delaware: 'DE',
    'District Of Columbia': 'DC',
    'Federated States Of Micronesia': 'FM',
    Florida: 'FL',
    Georgia: 'GA',
    Guam: 'GU',
    Hawaii: 'HI',
    Idaho: 'ID',
    Illinois: 'IL',
    Indiana: 'IN',
    Iowa: 'IA',
    Kansas: 'KS',
    Kentucky: 'KY',
    Louisiana: 'LA',
    Maine: 'ME',
    'Marshall Islands': 'MH',
    Maryland: 'MD',
    Massachusetts: 'MA',
    Michigan: 'MI',
    Minnesota: 'MN',
    Mississippi: 'MS',
    Missouri: 'MO',
    Montana: 'MT',
    Nebraska: 'NE',
    Nevada: 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Northern Mariana Islands': 'MP',
    Ohio: 'OH',
    Oklahoma: 'OK',
    Oregon: 'OR',
    Palau: 'PW',
    Pennsylvania: 'PA',
    'Puerto Rico': 'PR',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    Tennessee: 'TN',
    Texas: 'TX',
    Utah: 'UT',
    Vermont: 'VT',
    'Virgin Islands': 'VI',
    Virginia: 'VA',
    Washington: 'WA',
    'West Virginia': 'WV',
    Wisconsin: 'WI',
    Wyoming: 'WY'
}
const countries = {
    Afghanistan: 'AF',
    'Åland Islands': 'AX',
    Albania: 'AL',
    Algeria: 'DZ',
    'American Samoa': 'AS',
    AndorrA: 'AD',
    Angola: 'AO',
    Anguilla: 'AI',
    Antarctica: 'AQ',
    'Antigua and Barbuda': 'AG',
    Argentina: 'AR',
    Armenia: 'AM',
    Aruba: 'AW',
    Australia: 'AU',
    Austria: 'AT',
    Azerbaijan: 'AZ',
    Bahamas: 'BS',
    Bahrain: 'BH',
    Bangladesh: 'BD',
    Barbados: 'BB',
    Belarus: 'BY',
    Belgium: 'BE',
    Belize: 'BZ',
    Benin: 'BJ',
    Bermuda: 'BM',
    Bhutan: 'BT',
    Bolivia: 'BO',
    'Bosnia and Herzegovina': 'BA',
    Botswana: 'BW',
    'Bouvet Island': 'BV',
    Brazil: 'BR',
    'British Indian Ocean Territory': 'IO',
    'Brunei Darussalam': 'BN',
    Bulgaria: 'BG',
    'Burkina Faso': 'BF',
    Burundi: 'BI',
    Cambodia: 'KH',
    Cameroon: 'CM',
    Canada: 'CA',
    'Cape Verde': 'CV',
    'Cayman Islands': 'KY',
    'Central African Republic': 'CF',
    Chad: 'TD',
    Chile: 'CL',
    China: 'CN',
    'Christmas Island': 'CX',
    'Cocos (Keeling) Islands': 'CC',
    Colombia: 'CO',
    Comoros: 'KM',
    Congo: 'CG',
    'Congo, The Democratic Republic of the': 'CD',
    'Cook Islands': 'CK',
    'Costa Rica': 'CR',
    "Cote D'Ivoire": 'CI',
    Croatia: 'HR',
    Cuba: 'CU',
    Cyprus: 'CY',
    'Czech Republic': 'CZ',
    Denmark: 'DK',
    Djibouti: 'DJ',
    Dominica: 'DM',
    'Dominican Republic': 'DO',
    Ecuador: 'EC',
    Egypt: 'EG',
    'El Salvador': 'SV',
    'Equatorial Guinea': 'GQ',
    Eritrea: 'ER',
    Estonia: 'EE',
    Ethiopia: 'ET',
    'Falkland Islands (Malvinas)': 'FK',
    'Faroe Islands': 'FO',
    Fiji: 'FJ',
    Finland: 'FI',
    France: 'FR',
    'French Guiana': 'GF',
    'French Polynesia': 'PF',
    'French Southern Territories': 'TF',
    Gabon: 'GA',
    Gambia: 'GM',
    Georgia: 'GE',
    Germany: 'DE',
    Ghana: 'GH',
    Gibraltar: 'GI',
    Greece: 'GR',
    Greenland: 'GL',
    Grenada: 'GD',
    Guadeloupe: 'GP',
    Guam: 'GU',
    Guatemala: 'GT',
    Guernsey: 'GG',
    Guinea: 'GN',
    'Guinea-Bissau': 'GW',
    Guyana: 'GY',
    Haiti: 'HT',
    'Heard Island and Mcdonald Islands': 'HM',
    'Holy See (Vatican City State)': 'VA',
    Honduras: 'HN',
    'Hong Kong': 'HK',
    Hungary: 'HU',
    Iceland: 'IS',
    India: 'IN',
    Indonesia: 'ID',
    'Iran, Islamic Republic Of': 'IR',
    Iraq: 'IQ',
    Ireland: 'IE',
    'Isle of Man': 'IM',
    Israel: 'IL',
    Italy: 'IT',
    Jamaica: 'JM',
    Japan: 'JP',
    Jersey: 'JE',
    Jordan: 'JO',
    Kazakhstan: 'KZ',
    Kenya: 'KE',
    Kiribati: 'KI',
    "Korea, Democratic People'S Republic of": 'KP',
    'Korea, Republic of': 'KR',
    Kuwait: 'KW',
    Kyrgyzstan: 'KG',
    "Lao People'S Democratic Republic": 'LA',
    Latvia: 'LV',
    Lebanon: 'LB',
    Lesotho: 'LS',
    Liberia: 'LR',
    'Libyan Arab Jamahiriya': 'LY',
    Liechtenstein: 'LI',
    Lithuania: 'LT',
    Luxembourg: 'LU',
    Macao: 'MO',
    'Macedonia, The Former Yugoslav Republic of': 'MK',
    Madagascar: 'MG',
    Malawi: 'MW',
    Malaysia: 'MY',
    Maldives: 'MV',
    Mali: 'ML',
    Malta: 'MT',
    'Marshall Islands': 'MH',
    Martinique: 'MQ',
    Mauritania: 'MR',
    Mauritius: 'MU',
    Mayotte: 'YT',
    Mexico: 'MX',
    'Micronesia, Federated States of': 'FM',
    'Moldova, Republic of': 'MD',
    Monaco: 'MC',
    Mongolia: 'MN',
    Montserrat: 'MS',
    Morocco: 'MA',
    Mozambique: 'MZ',
    Myanmar: 'MM',
    Namibia: 'NA',
    Nauru: 'NR',
    Nepal: 'NP',
    Netherlands: 'NL',
    'Netherlands Antilles': 'AN',
    'New Caledonia': 'NC',
    'New Zealand': 'NZ',
    Nicaragua: 'NI',
    Niger: 'NE',
    Nigeria: 'NG',
    Niue: 'NU',
    'Norfolk Island': 'NF',
    'Northern Mariana Islands': 'MP',
    Norway: 'NO',
    Oman: 'OM',
    Pakistan: 'PK',
    Palau: 'PW',
    'Palestinian Territory, Occupied': 'PS',
    Panama: 'PA',
    'Papua New Guinea': 'PG',
    Paraguay: 'PY',
    Peru: 'PE',
    Philippines: 'PH',
    Pitcairn: 'PN',
    Poland: 'PL',
    Portugal: 'PT',
    'Puerto Rico': 'PR',
    Qatar: 'QA',
    Reunion: 'RE',
    Romania: 'RO',
    'Russian Federation': 'RU',
    RWANDA: 'RW',
    'Saint Helena': 'SH',
    'Saint Kitts and Nevis': 'KN',
    'Saint Lucia': 'LC',
    'Saint Pierre and Miquelon': 'PM',
    'Saint Vincent and the Grenadines': 'VC',
    Samoa: 'WS',
    'San Marino': 'SM',
    'Sao Tome and Principe': 'ST',
    'Saudi Arabia': 'SA',
    Senegal: 'SN',
    'Serbia and Montenegro': 'CS',
    Seychelles: 'SC',
    'Sierra Leone': 'SL',
    Singapore: 'SG',
    Slovakia: 'SK',
    Slovenia: 'SI',
    'Solomon Islands': 'SB',
    Somalia: 'SO',
    'South Africa': 'ZA',
    'South Georgia and the South Sandwich Islands': 'GS',
    Spain: 'ES',
    'Sri Lanka': 'LK',
    Sudan: 'SD',
    Suriname: 'SR',
    'Svalbard and Jan Mayen': 'SJ',
    Swaziland: 'SZ',
    Sweden: 'SE',
    Switzerland: 'CH',
    'Syrian Arab Republic': 'SY',
    'Taiwan, Province of China': 'TW',
    Tajikistan: 'TJ',
    'Tanzania, United Republic of': 'TZ',
    Thailand: 'TH',
    'Timor-Leste': 'TL',
    Togo: 'TG',
    Tokelau: 'TK',
    Tonga: 'TO',
    'Trinidad and Tobago': 'TT',
    Tunisia: 'TN',
    Turkey: 'TR',
    Turkmenistan: 'TM',
    'Turks and Caicos Islands': 'TC',
    Tuvalu: 'TV',
    Uganda: 'UG',
    Ukraine: 'UA',
    'United Arab Emirates': 'AE',
    'United Kingdom': 'GB',
    'United States': 'US',
    'United States Minor Outlying Islands': 'UM',
    Uruguay: 'UY',
    Uzbekistan: 'UZ',
    Vanuatu: 'VU',
    Venezuela: 'VE',
    'Viet Nam': 'VN',
    'Virgin Islands, British': 'VG',
    'Virgin Islands, U.S.': 'VI',
    'Wallis and Futuna': 'WF',
    'Western Sahara': 'EH',
    Yemen: 'YE',
    Zambia: 'ZM',
    Zimbabwe: 'ZW'
}

const cyber = (profs) => {
    let cyber = new Array()
    for(const profile of profs) {
        let added = {
            "name": profile.profile_name,
            "email": profile.email,
            "phone": profile.shipping.phone,
            "sizes": [
                "Random"
            ],
            "modes": [
                "Fast"
            ],
            "taskAmount": 1,
            "singleCheckout": profile.one_checkout,
            "billingDifferent": profile.sameBilling,
            "favorite": false,
            "card": {
                "number": profile.payment.cnb,
                "expiryMonth": profile.payment.month,
                "expiryYear": profile.payment.year,
                "cvv": profile.payment.cvv
            },
            "paypal": {
                "email": "",
                "password": ""
            },
            "delivery": {
                "firstName": profile.shipping.name.split(' ')[0],
                "lastName": profile.shipping.name.split(' ')[1],
                "address1": profile.shipping.addy1,
                "address2": profile.shipping.addy2,
                "zip": profile.shipping.zip,
                "city": profile.shipping.city,
                "country": profile.shipping.country,
                "state": profile.shipping.state
            },
            "billing": {
                "firstName": profile.billing.name.split(' ')[0],
                "lastName": profile.billing.name.split(' ')[1],
                "address1": profile.billing.addy1,
                "address2": profile.billing.addy2,
                "zip": profile.billing.zip,
                "city": profile.billing.city,
                "country": profile.billing.country,
                "state": profile.billing.state
            }
        }
        cyber.push(added)
    }

    return cyber
} 

const dashe = (profs) => {
    let dashe = {}
    for(const profile of profs) {
        dashe[profile.profile_name] = {
            "billing": {
                "address": profile.billing.addy1,
                "apt": profile.billing.addy2,
                "city": profile.billing.city,
                "country": profile.billing.country,
                "firstName": profile.billing.name.split(' ')[0],
                "lastName": profile.billing.name.split(' ')[1],
                "phoneNumber": profile.billing.phone,
                "state": abbrv[profile.billing.state],
                "zipCode": profile.billing.zip
            },
                "billingMatch": profile.sameBilling,
                "card": {
                    "cvv": profile.payment.cvv,
                    "holder": profile.payment.name,
                    "month": profile.payment.month,
                    "number": profile.payment.cnb,
                    "year": `20${profile.payment.year}`
            },
                "email": profile.email,
                "profileName": profile.profile_name,
                "shipping": {
                    "address": profile.shipping.addy1,
                    "apt": profile.shipping.addy2,
                    "city": profile.shipping.city,
                    "country": profile.shipping.country,
                    "firstName": profile.shipping.name.split(' ')[0],
                    "lastName": profile.shipping.name.split(' ')[1],
                    "phoneNumber": profile.shipping.phone,
                    "state": abbrv[profile.billing.state],
                    "zipCode": profile.shipping.zip
                }
        }
    }

    return dashe;
}

const ganesh = (profs) => {
    let start = 'STORE,MODE,PRODUCT,SIZE,TIMER,FIRST NAME,LAST NAME,EMAIL,PHONE NUMBER,ADDRESS LINE 1,ADDRESS LINE 2,CITY,STATE,POSTCODE / ZIP,COUNTRY,CARD NUMBER,EXPIRE MONTH,EXPIRE YEAR,CARD CVC\n'
    for(const profile of profs) {
        start += `"",,,,,${profile.shipping.name.split(' ')[0]},${profile.shipping.name.split(' ')[1]},${profile.email},${profile.shipping.phone},${profile.shipping.addy1},${profile.shipping.addy2},${profile.shipping.city},${abbrv[profile.shipping.state]},${profile.shipping.zip},${countries[profile.shipping.country]},${profile.payment.cnb},${profile.payment.month},20${profile.payment.year},${profile.payment.cvv}\n`
    }
    return start
}

const nebula = (profs) => {
    let neb = new Array()
    for(const profile of profs) {
        let newp = {
            "name": profile.profile_name,
            "matches": profile.sameBilling,
            "billing": {
                "name": profile.billing.name,
                "address": profile.billing.addy1,
                "apt": profile.billing.addy2,
                "city": profile.billing.city,
                "province": {
                    "value": abbrv[profile.billing.state],
                    "label": profile.billing.state
                },
                "zip": profile.billing.zip,
                "country": {
                    "value": countries[profile.billing.country],
                    "label": profile.billing.country
                },
                "phone": profile.billing.phone,
                "email": profile.billing.email
            },
            "shipping": {
                "name": profile.shipping.name,
                "address": profile.shipping.addy1,
                "apt": profile.shipping.addy2,
                "city": profile.shipping.city,
                "province": {
                    "value": abbrv[profile.shipping.state],
                    "label": profile.shipping.state
                },
                "zip": profile.shipping.zip,
                "country": {
                    "value": countries[profile.shipping.country],
                    "label": profile.shipping.country
                },
            "phone": profile.shipping.phone,
            "email": profile.email
            },
            "payment": {
                "holder": profile.payment.name,
                "card": profile.payment.cnb,
                "exp": `${profile.payment.month}/${profile.payment.year}`,
                "cvv": profile.payment.cvv,
                "type": profile.payment.type.toLowerCase()
            }
        }
        neb.push(newp)
    }

    return neb;
}

const balko = (profs) => {
    let balko = {
        info: []
    }

    for(const profile of profs) {
        balko.info.push({
            "id": profile.profile_name,
            "firstname": profile.name.split(' ')[0],
            "lastname": profile.name.split(' ')[1],
            "email": profile.email,
            "phone": profile.shipping.phone,
            "add1": profile.shipping.addy1,
            "add2": profile.shipping.addy2,
            "state": profile.shipping.state,
            "zip": profile.shipping.zip,
            "country": profile.shipping.country,
            "city": profile.shipping.city,
            "ccfirst": profile.payment.name.split(' ')[0],
            "cclast": profile.payment.name.split(' ')[1],
            "cc": profile.payment.cnb,
            "expm": profile.payment.month,
            "expy": `20${profile.payment.year}`,
            "ccv": profile.payment.cvv,
            "random": false,
            "dotTrick": false,
            "oneCheckout": profile.one_checkout,
            "bfirstname": profile.billing.name.split(' ')[0],
            "blastname": profile.billing.name.split(' ')[1],
            "badd1": profile.billing.addy1,
            "badd2": profile.billing.addy2,
            "bstate": profile.billing.state,
            "bzip": profile.billing.zip,
            "bcountry": profile.billing.country,
            "bcity": profile.billing.city
        })
    }

    return balko;
}

const hawk = (profs) => {
    let start = `profile name,email,first name,last name,address 1,address 2,city,post code,country,phone,name on credit card(leave blank if paypal/manual),credit card number(leave credit card fields blank if paypal/manual),credit card month expiry,credit card year expiry,credit card cvv,paypal (true/false),manual checkout(true/false),one checkout profile(true/false)\n`
    for(const profile of profs) {
        start += `${profile.profile_name},${profile.email},${profile.shipping.name.split(' ')[0]},${profile.shipping.name.split(' ')[1]},${profile.shipping.addy1},${profile.shipping.addy2},${profile.shipping.city},${profile.shipping.zip},${profile.shipping.country},${profile.shipping.phone},${profile.payment.name},${profile.payment.cnb},${profile.payment.month},20${profile.payment.year},${profile.payment.cvv},false,false,${profile.one_checkout}\n`
    }
    return start;
}

const kage = (profs) => {
    let kage = `Profile,ProfileEmail,First Name,Last Name,Phone Number,Shipping Street1,Shipping Street2,Shipping City,Shipping Zip,Shipping State,Billing First,Billing Last,Billing Street1,Billing Street2,Billing City,Billing Zip,Billing State,Country,Card Number,Card CVV,Card Month,Card Year\n`
    for(const profile of profs) {
        kage += `${profile.profile_name},${profile.email},${profile.shipping.name.split(' ')[0]},${profile.shipping.name.split(' ')[1]},${profile.shipping.phone},${orifule.shipping.addy1},${profile.shipping.addy2},${profile.shipping.city},${profile.shipping.zip},${abbrv[profile.shipping.state]},${profile.billing.name.split(' ')[0]},${profile.billing.name.split(' ')[1]},${profile.billing.addy1},${profile.billing.addy2},${profile.billing.city},${profile.billing.zip},${abbrv[profile.billing.state]},${countries[profile.billing.country]},${profile.payment.cnb},${profile.payment.cvv},${profile.payment.month},20${profile.payment.year}\n`
    }
    return kage;
}

const lex = (profs) => {
    let lex_a = new Array()
    for(const profile of profs) {
        let newp = {
            "profile_name": profile.profile_name,
            "email": profile.email,
            "shipping_address": {
                "address_line1": profile.shipping.addy1,
                "address_line2": profile.shipping.addy2,
                "address_type": "SHIPPING",
                "city": profile.shipping.city,
                "country": countries[profile.shipping.country],
                "first_name": profile.shipping.name.split(' ')[0],
                "last_name": profile.shipping.name.split(' ')[1],
                "mobile": profile.shipping.phone,
                "state": abbrv[profile.shipping.state],
                "zip_code": profile.shipping.zip
            },
            "billing_info": {
                "card_details": {
                    "card_name": profile.payment.name,
                    "card_number": profile.payment.cnb,
                    "cvv": profile.payment.cvv,
                    // "expiry_month": "4",
                    "expiry_year": `20${profile.payment.year}`
                },
                "billing_address": {
                    "address_line1": profile.billing.addy1,
                    "city": profile.billing.city,
                    "first_name": profile.billing.name.split(' ')[0],
                    "last_name": profile.billing.name.split(' ')[1],
                    "phone": profile.billing.phone,
                    "state": abbrv[profile.billing.state],
                    "zip_code": profile.billing.zip,
                    "country": countries[profile.billing.country]
                }
            }
        }
        if(profile.payment.month.charAt(0) === '0') {
            newp.expiry_month = profile.payment.month.charAt(1)
        }else {
            newp.expiry_month = profile.payment.month
        }
    }

    return lex_a;
}

const nsb = (profs) => {
    let nsb = new Array()
    for(const profile of profs) {
        let newp = {
            "shipping": {
                "firstname": profile.shipping.name.split(' ')[0],
                "lastname": profile.shipping.name.split(' ')[1],
                "country": countries[profile.shipping.country],
                "city": profile.shipping.city,
                "address": profile.shipping.addy1,
                "address2": profile.shipping.addy2,
                "state": abbrv[profile.shipping.state],
                "zip": profile.shipping.zip,
                "phone": profile.shipping.phone
            },
            "billing": {
                "firstname": profile.billing.name.split(' ')[0],
                "lastname": profile.billing.name.split(' ')[1],
                "country": countries[profile.billing.country],
                "city": profile.billing.city,
                "address": profile.billing.addy1,
                "address2": profile.billing.addy2,
                "state": abbrv[profile.billing.state],
                "zip": profile.billing.zip,
                "phone": profile.billing.phone
            },
            "name": profile.profile_name,
            "cc": {
                "number": profile.payment.cnb,
                "expiry": `${profile.payment.month} / 20${profile.payment.year}`,
                "cvc": profile.payment.cvv,
                "name": profile.payment.name
            },
                "email": profile.email,
                "checkoutLimit": "0",
                "billingSame": profile.sameBilling,
                "date": Date.now()
        }
        nsb.push(newp)
    }

    return nsb
}

const polaris = profs => {
    let pol = new Array()
    for(const profile of profs) {
        let u = v4()
        let newp = {
            "name": profile.profile_name,
            "uuid": u,
            "email": profile.email,
            "shipping": {
                "first_name": profile.shipping.name.split(' ')[0],
                "last_name": profile.shipping.name.split(' ')[1],
                "address_line_1": profile.shipping.addy1,
                "address_line_2": profile.shipping.addy2,
                "company": "",
                "state": {
                    "label": profile.shipping.state,
                    "value": abbrv[profile.shipping.state]
                },
                "country": {
                    "label": profile.shipping.country,
                    "value": countries[profile.shipping.country]
                },
                "phone": profile.shipping.phone,
                "city": profile.shipping.city,
                "zipcode": profile.shipping.zip
            },
            "billing": {
                "first_name": profile.billing.name.split(' ')[0],
                "last_name": profile.billing.name.split(' ')[1],
                "address_line_1": profile.billing.addy1,
                "address_line_2": profile.billing.addy2,
                "company": "",
                "state": {
                    "label": profile.billing.state,
                    "value": abbrv[profile.billing.state]
                },
                "country": {
                    "label": profile.billing.country,
                    "value": country[profile.billing.country]
                },
                "phone": profile.billing.phone,
                "city": profile.billing.city,
                "zipcode": profile.billing.zip
                },
            "card": {
                "number": profile.payment.cnb,
                "expiry": {
                    "month": {
                    "label": profile.payment.month,
                    "value": parseInt(profile.payment.month)
                    },
                    "year": {
                    "label": `20${profile.payment.year}`,
                    "value": `20${profile.payment.year}`
                    }
                },
                "cvv": profile.payment.cvv
            },
            "sameAddress": profile.sameBilling,
            "id": Date.now()
        }
        pol.push(newp)
    }

    return pol
}

const prism = profs => {
    let prm = new Array()
    for(const profile of profs) {
        let newp = {
            "name": profile.profile_name,
            "email": profile.email,
            "oneTimeUse": profile.one_checkout,
            "shipping": {
                "firstName": profile.shipping.name.split(' ')[0],
                "lastName": profile.shipping.name.split(' ')[1],
                "address1": profile.shipping.addy1,
                "address2": profile.shipping.addy2,
                "city": profile.shipping.city,
                "province": profile.shipping.state,
                "postalCode": profile.shipping.zip,
                "country": profile.shipping.country,
                "phone": profile.shipping.phone
            },
            "payment": {
                "name": profile.payment.name,
                "num": profile.payment.cnb,
                "year": `20${profile.payment.year}`,
                "month": profile.payment.month,
                "cvv": profile.payment.cvv
            },
            "id": `prf-${v4()}`,
            "createdAt": Date.now(),
            "updatedAt": Date.now()
        }
        if(profile.sameBilling) {
            newp.billing = {
                "sameAsShipping": true,
                "firstName": "",
                "lastName": "",
                "address1": "",
                "address2": "",
                "city": "",
                "province": null,
                "postalCode": "",
                "country": null,
                "phone": ""
            }
        }else {
            newp.billing = {
                "sameAsShipping": false,
                "firstName": profile.billing.name.split(' ')[0],
                "lastName": profile.billing.name.split(' ')[1],
                "address1": profile.billing.addy1,
                "address2": profile.billing.addy2,
                "city": profile.billing.city,
                "province": profile.billing.state,
                "postalCode": profile.billing.zip,
                "country": profile.billing.country,
                "phone": profile.billing.phone
            }
        }

        newp.push(prm)
    }  

    return prm
}

const mekaio = profs => {
    let meka = {
        aioExportProfiles: []
    }

    for(const profile of profs) {
        let newp = {
            "name": profile.profile_name,
            "email": profile.email,
            "phone": profile.shipping.phone,
            "cardHolder": profile.payment.name,
            "cardNum": profile.payment.cnb,
            "cvv": profile.payment.cvv,
            "expmonth": profile.payment.month,
            "expyear": `20${profile.payment.year}`,
            "isQuickProfile": false,
            "isOneCheckout": profile.one_checkout,
            "isBillingSameAsShipping": profile.sameBilling,
            "shipping": {
                "firstName": profile.shipping.name.split(' ')[0],
                "lastName": profile.shipping.name.split(' ')[1],
                "address1": profile.shipping.addy1,
                "address2": profile.shipping.addy2,
                "state": {
                    "short": abbrv[profile.shipping.state],
                    "long": profile.shipping.state
                },
                "city": profile.shipping.city,
                "country": {
                    "short": countries[profile.shipping.country],
                    "long": profile.shipping.country
                },
                "zip": profile.shipping.zip
            },
            "billing": {
                "firstName": profile.billing.name.split(' ')[0],
                "lastName": profile.billing.name.split(' ')[1],
                "address1": profile.billing.addy1,
                "address2": profile.billing.addy2,
                "state": {
                    "short": abbrv[profile.billing.state],
                    "long": profile.billing.state
                },
                "city": profile.billing.city,
                "country": {
                    "short": countries[profile.billing.country],
                    "long": profile.billing.country
                },
                "zip": profile.billing.zip
            },
            "key": v4()
        }
    }

    return meka
}

const splashforce = profs => {
    let sf = new Array()
    for(const profile of profs) {
        let newp = {
            "profileName": profile.profile_name,
            "email": profile.email,
            "billingAddress": {
                "firstName": profile.billing.name.split(' ')[0],
                "lastName": profile.billing.split(' ')[1],
                "addressOne": profile.billing.addy1,
                "addressTwo": profile.billing.addy2,
                "zip": profile.billing.zip,
                "city": profile.billing.city,
                "state": profile.billing.state,
                "country": profile.billing.country,
                "phone": profile.billing.phone
            },
            "shippingAddress": {
                "firstName": profile.shipping.name.split(' ')[0],
                "lastName": profile.shipping.name.split(' ')[1],
                "addressOne": profile.shipping.addy1,
                "addressTwo": profile.shipping.addy2,
                "zip": profile.shipping.zip,
                "city": profile.shipping.city,
                "state": profile.shipping.state,
                "country": profile.shipping.country,
                "phone": profile.shipping.phone
            },
            "card": {
                "cardHolderName": profile.payment.name,
                "cardNumber": profile.payment.cnb,
                "cardExpiryMonth": profile.payment.month,
                "cardExpiryYear": `20${profile.payment.year}`,
                "cardCVV": profile.payment.cvv
            },
            "jigAddress": false,
            "oneCheckout": profile.one_checkout,
            "shipToBill": profile.sameBilling,
            "useThreeD": false
        }
        sf.push(newp)
    }

    return sf
}

const re = profs => {
    const group = v4()
    let re_aio = `profileName,firstName,lastName,email,phone,country,state,firstNameForDelivery,lastNameForDelivery,deliveryAddressOne,deliveryAddressTwo,city,zipCode,useBillingAddress,countryForBilling,stateForBilling,firstNameForBilling,lastNameForBilling,addressOneForBilling,addressTwoForBilling,cityForBilling,zipCodeForBilling,cardType,cardHolder,cardNumber,expiredMonth,expiredYear,cvv,id,groupId\n`
    for(const profile of profs) {
        re_aio += `${profile.profile_name},${profile.billing.name.split(' ')[0]},${profile.billing.name.split(' ')[1]},${profile.email},${profile.billing.phone},${countries[profile.billing.country].toLowerCase()},${profile.billing.state},${profile.shipping.name.split(' ')[0]},${profile.shipping.name.split(' ')[1]},${profile.shipping.addy1},${profile.shipping.addy2},${profile.shipping.city},${profile.shipping.zip},${profile.sameBilling},`
        if(profile.payment.type.toLowerCase() === 'mastercard') {
            re_aio += `master`
        }else {
            re_aio += profile.payment.type.toLowerCase()
        }
        re_aio += `${profile.payment.name},${profile.payment.cnb},${profile.payment.month},20${profile.payment.year},${profile.payment.cvv},${v4()},${group}`
    }

    return re_aio
}

const estock = profs => {
    let epoop = new Array()
    for(const profile of profs) {
        let newp = {
            "profileName": profile.profile_name,
            "firstName": profile.shipping.name.split(' ')[0],
            "lastName": profile.shipping.split(' ')[1],
            "line1": profile.shipping.addy1,
            "line2": profile.shipping.addy2,
            "email": profile.email,
            "phone": profile.shipping.phone,
            "city": profile.shipping.city,
            "state": abbrv[profile.shipping.state],
            "country": profile.shipping.country,
            "zip": profile.shipping.zip,
            "billingFirstName": profile.billing.name.split(' ')[0],
            "billingLastName": profile.billing.name.split(' ')[1],
            "billingLine1": profile.billing.addy1,
            "billingLine2": profile.billing.addy2,
            "billingEmail": profile.email,
            "billingPhone": profile.billing.phone,
            "billingCity": profile.billing.city,
            "billingState": abbrv[profile.billing.state],
            "billingCountry": profile.billing.country,
            "billingZip": profile.billing.zip,
            "nameOnCard": profile.payment.name,
            "cardNumber": profile.payment.cnb,
            "cardExpMonth": profile.payment.month,
            "cardExpYear": `20${profile.payment.year}`,
            "cardCvv": profile.payment.cvv,
            "sameShippingAndBilling": profile.sameBilling
        }

        epoop.push(newp)
    }

    return epoop
}

const rush = profs => {
    let rushaio = `profile_name,email,ship_name,ship_phone,ship_address1,ship_address2,ship_city,ship_zip,ship_state,ship_country,card_name,card_address1,card_address2,card_city,card_zip,card_state,card_country,card_phone,card_number,card_cvc,card_expmonth,card_expyear,size\n`
    for(const profile of profs) {
        rushaio += `${profile.profile_name},${profile.email},${profile.shipping.name},${profile.shipping.phone.substring(0, 3)}-${profile.shipping.phone.substring(3, 6)}-${profile.shipping.phone.substring(6)},${profile.shipping.addy1},${profile.shipping.addy2},${profile.shipping.city},${profile.shipping.zip},${abbrv[profile.shipping.state]},${countries[profile.shipping.country]},${profile.billing.name},${profile.billing.addy1},${profile.billing.addy2},${profile.billing.city},${profile.billing.zip},${abbrv[profile.billing.state]},${countries[profile.billing.country]},${profile.billing.phone.substring(0, 3)}-${profile.billing.phone.substring(3, 6)}-${profile.billing.phone.substring(6)},${profile.payment.cnb},${profile.payment.cvv},${profile.payment.month},${profile.payment.year},\n`
    }

    return rushaio
}

const wrath = profs => {
    let wraf = new Array()
    for(const profile of profs) {
        let newp = {
            "billingAddress": {
                "city": profile.billing.city,
                "country": profile.billing.country,
                "email": profile.email,
                "line1": profile.billing.addy1,
                "line2": profile.billing.addy2,
                "line3": "",
                "name": profile.billing.name,
                "phone": profile.billing.phone,
                "postCode": profile.billing.zip,
                "state": abbrv[profile.billing.state]
            },
            "name": profile.profile_name,
            "onlyCheckoutOnce": profile.one_checkout,
            "paymentDetails": {
                "cardCvv": profile.payment.cvv,
                "cardExpMonth": profile.payment.month,
                "cardExpYear": profile.payment.year,
                "cardNumber": profile.payment.cnb,
                "cardType": profile.payment.type,
                "nameOnCard": profile.payment.name
            },
            "sameBillingAndShippingAddress": profile.sameBilling,
            "shippingAddress": {
                "city": profile.shipping.city,
                "country": profile.shipping.country,
                "email": profile.email,
                "line1": profile.shipping.addy1,
                "line2": profile.shipping.addy2,
                "line3": "",
                "name": profile.shipping.name,
                "phone": profile.shipping.phone,
                "postCode": profile.shipping.zip,
                "state": abbrv[profile.shipping.state]
            }
        }
        wraf.push(newp)
    }

    return wraf
}

const kodai = profs => {
    let ko = {}
    for(const profile of profs) { 
        ko[profile.profile_name] = {
            "billingAddress": {
                "address": profile.billing.addy1,
                "apt": profile.billing.addy2,
                "city": profile.billing.city,
                "firstName": profile.billing.name.split(' ')[0],
                "lastName": profile.billing.name.split(' ')[1],
                "phoneNumber": profile.billing.phone,
                "state": profile.billing.state,
                "zipCode": profile.billing.zip
            },
            "deliveryAddress": {
                "address": profile.shipping.addy1,
                "apt": profile.shipping.addy2,
                "city": profile.shipping.city,
                "firstName": profile.shipping.name.split(' ')[0],
                "lastName": profile.shipping.name.split(' ')[1],
                "phoneNumber": profile.shipping.phone,
                "state": profile.shipping.state,
                "zipCode": profile.shipping.zip
            },
            "miscellaneousInformation": {
                "deliverySameAsBilling": profile.sameBilling
            },
            "paymentDetails": {
                "cardHolder": profile.payment.name,
                "cardNumber": profile.payment.cnb,
                "cvv": profile.payment.cvv,
                "emailAddress": profile.email,
                "expirationDate": `${profile.payment.month}/${profile.payment.year}`
            },
            "profileName": profile.profile_name,
            "region": profile.shipping.country
        }
    }


    return ko
}

const torpedo = profs => {
    let torp = new Array()
    for(const profile of profs) {
        let newp = {
            "id": Date.now(),
            "data": {
                "bFName": profile.billing.name.split(' ')[0],
                "bLName": profile.billing.name.split(' ')[1],
                "bAdd": profile.billing.addy1,
                "bAdd2": profile.billing.addy2,
                "bCity": profile.billing.city,
                "bState": abbrv[profile.billing.state],
                "bZip": profile.billing.zip,
                "sFName": profile.shipping.name.split(' ')[0],
                "sLName": profile.shipping.name.split(' ')[1],
                "sAdd": profile.shipping.addy1,
                "sAdd2": profile.shipping.addy2,
                "sCity": profile.shipping.city,
                "sState": abbrv[profile.shipping.state],
                "sZip": profile.shipping.zip,
                "shipSameBill": profile.sameBilling,
                "cardName": profile.payment.name,
                "cardNum": profile.payment.cnb,
                "expMM": profile.payment.month,
                "expYY": profile.payment.year,
                "cvv": profile.payment.cvv,
                "title": profile.profile_name,
                "email": profile.email,
                "phone": profile.shipping.phone
            }
        }

        torp.push(newp)
    }

    return torp
}

module.exports = {
    cyber: cyber,
    dashe: dashe,
    ganesh: ganesh,
    nebula: nebula,
    balko: balko,
    hawk: hawk,
    kage: kage,
    lex: lex,
    nsb: nsb,
    polaris: polaris,
    prism: prism,
    mekaio: mekaio,
    splashforce: splashforce,
    re: re,
    estock: estock,
    rush: rush,
    wrath: wrath,
    kodai: kodai,
    torpedo: torpedo
}