const nodemailer = require('nodemailer')
require('dotenv').config()

// ------ Generate OTP --------

const generateOtp = () => Math.floor(1000 + Math.random() * 9000)

// ---- nodeMailer ----

const sendVerifyMail = async (name, email, otp) => {
    console.log(otp)
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.userEmail,
            pass: process.env.userPassword
        }
    })

    const mailOptions = {
        from: 'abhinandts116@gmail.com',
        to: email,
        subject: 'Verification mail',
        html: '<p> Hi' + name + ',' + otp + ' is your OTP </p>'
    }

    const info = await transporter.sendMail(mailOptions);

    console.log("Email has been sent", info.response)


    const reverseval = transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
            return false
        } else {
            console.log("email has sent", info.response)
            return false
        }
    })
    return reverseval
}


module.exports = {
    generateOtp,
    sendVerifyMail
}