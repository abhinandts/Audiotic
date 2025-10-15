const nodemailer = require("nodemailer");
const config = require("../config/env");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: config.nodemailerId,
    pass: config.nodemailerPass,
  },
});

const sendMail = async (to, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `AUDIOTIC<${config.nodemailerId}>`,
      to,
      subject: "Your Verification Code",
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to AUDIOTIC!</h2>
            <p>Thank you for registering with AUDIOTIC. Please use the following OTP to complete your registration:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; margin: 0;">${otp}</h1>
              <p style="margin: 5px 0; color: #666;">This OTP will expire in 10 minutes</p>
            </div>
            <p>If you didn't request this OTP, please ignore this email.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              This is an automated message from AUDIOTIC. Please do not reply to this email.
            </p>
          </div>
        `,
    });

    return info;
  } catch (error) {
    console.error("Error sending mail", error);
    return false;
  }
};

module.exports = { sendMail };
