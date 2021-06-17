const console = require("../../../../utils/logger");
const names = require("node-random-name");
const playwright = require("playwright");
const { loadProxies } = require("../../../proxies/index");
const numbers = "1234567890";

class TargetAccount {
  constructor(catchall, page) {
    const fname = names({ first: true });
    const lname = names({ last: true });
    this.email =
      fname +
      lname +
      numbers.charAt(Math.random() * (numbers.length - 1)) +
      catchall;
    this.pass =
      fname + lname + numbers.charAt(Math.random() * (numbers.length - 1));
    this.fname = fname;
    this.lname = lname;
    this.created = false;
    this.page = page;
  }

  getDetails() {
    if (!this.created) return false;
    return this.email + ":" + this.pass;
  }

  async generate() {
    //gets to signup
    console.log("Navigating to Signup");
    try {
      await this.page.goto(
        "https://gsp.target.com/gsp/authentications/v1/auth_codes?client_id=ecom-web-1.0.0&state=1621662171222&redirect_uri=https%3A%2F%2Fwww.target.com%2F&assurance_level=M" /*, {timeout: 4000}*/
      );
    } catch (e) {
      console.log(e, "error");
      return false;
    }

    await this.page.click("#createAccount");

    //creation
    console.log("Filling Information");
    await this.page.fill("#username", this.email);
    await this.page.fill("#firstname", this.fname);
    await this.page.fill("#lastname", this.lname);
    await this.page.fill("#password", this.pass);

    //checks for success/error
    try {
      console.log("Creating Account...");
      await this.page.click("#createAccount");
      await this.page.waitForSelector("button[id='circle-skip']", {
        timeout: 2000,
      });
      console.log("Created!");
      this.created = true;
      return true;
    } catch (e) {
      console.log(e, "error");
      return false;
    }
  }
}

module.exports = TargetAccount;
