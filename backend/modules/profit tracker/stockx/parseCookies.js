const tough = require("tough-cookie");
const fs = require("fs");
const { login } = require("./login");
const path = require("path");

module.exports = async (session = false) => {
  if (!session) {
    if (
      !fs.existsSync(
        path.join(process.env.APPDATA, "purpl", "local-data", "session.json")
      )
    )
      await login();
    var data = fs.readFileSync(
      path.join(process.env.APPDATA, "purpl", "local-data", "session.json")
    );
    var { cookies } = JSON.parse(data);
  } else {
    var { cookies } = session;
  }


  const token = cookies.filter((item) => item.name === "token");


  const jar = new tough.CookieJar();
  cookies.forEach((cookie) => {
    if (cookie.domain === "stockx.com") {
      jar.setCookie(
        tough.Cookie.fromJSON(JSON.stringify(cookie)),
        "https://stockx.com/"
      );
    }
  });

  return {
    jar,
    token: token[0].value,
  };
};
