require("dotenv").config();

const config = {
  port: process.env.PORT,
  mongoURI: process.env.MONGO_URI,
  sessionSecret: process.env.SESSION_SECRET,
  nodemailerId: process.env.NODEMAILER_EMAIL,
  nodemailerPass: process.env.NODEMAILER_PASSWORD,
};

module.exports = config;
