const winston = require("winston");
const { v4 } = require("uuid");
require("dotenv").config();
const path = require("path");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({
      filename: path.join(
        process.env.APPDATA,
        "purpl",
        "local-data",
        "logs",
        v4()
      ),
    }),
  ],
});

if (process.env.NODE_ENV === "development") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

console.log(process.env.NODE_ENV);

const log = (message, level = "info") => {
  logger.log({
    level,
    message,
  });
};

module.exports = {
  log,
};
