const got = require("got");

class SMS_ACTIVATE {
  apiKey;
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async requestNumber() {
    const res = await got.get(`https://sms-activate.ru/stubs/handler_api.php`, {
      searchParams: {
        api_key: this.apiKey,
        service: "am",
        action: "getNumber",
        country: 187,
      },
    });

    console.log(res.body);
  }
}

const acti = new SMS_ACTIVATE("9540702Acc1Ac60130195A8A600e2283");
acti.requestNumber();
