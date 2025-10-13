require("dotenv").config();

const config = {
  port: process.env.PORT,
  mongoURI: process.env.MONGO_URI,
  sessionSecret: process.env.SESSION_SECRET,
};

module.exports = config
