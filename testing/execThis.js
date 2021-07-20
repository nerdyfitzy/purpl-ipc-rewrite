const puppeteer = require("puppeteer");

const uhuh = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  await browser.newPage();

  process.stdout.write(JSON.stringify({ yes: 1, no: 0 }));
};

uhuh();
