const got = require("got");

class Onlinesim {
  apiKey;
  constructor(apikey) {
    this.apiKey = apikey;
  }

  async getNumber() {
    const res = await got.get("http://onlinesim.ru/api/getNum.php", {
      headers: {
        accept: "application/json",
      },
      searchParams: {
        apikey: this.apiKey,
        service: "amazon",
      },
    });
  }
}
