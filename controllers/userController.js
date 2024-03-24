const User = require('../models/userModel')
const bcrypt = require('bcrypt')

const session = require('express-session')
const config = require('../config/config')

const nodemailer = require('nodemailer')

// ---- nodeMailer ----

const sendVerifyMail = async (name, email, otp) => {
    console.log(otp)
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: 'abhinandts116@gmail.com',
            pass: 'vbzm mdaz pjgy czsb'
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
    console.log(reverseval)

    return reverseval
}

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash

    } catch (error) {
        console.log(error.message)
    }
}

// ----------- Load register ----------------

const loadRegister = async (req, res) => {
    try {
        res.render('registration')
        console.log("register Page loaded")
    }
    catch (error) {
        console.log(error.message)
    }
}

// ------ Generate OTP ----------------------

const generateOtp = () => Math.floor(1000 + Math.random() * 9000)

// ----insertUser------------------------

const insertUser = async (req, res) => {
    try {
        let sendVerifyMailRes

        const otp = generateOtp()
        console.log(`Otp generated from ${otp}`)

        const { name, email, mobile, password } = req.body
        const data = {
            name, email, mobile, password, otp
        }
        req.session.Data = data

        if (data) {
            sendVerifyMailRes = sendVerifyMail(req.session.Data.name, req.session.Data.email, req.session.Data.otp)
            if (sendVerifyMailRes) {
                console.log("email true")
            }
            else {
                console.log("emnail false");
            }
        }

        if (sendVerifyMailRes) {
            res.redirect('/verify_otp')
        } else {
            res.redirect('/register')
        }

    } catch (error) {
        console.log(error.message)
    }
}

// ---- get verify --

const verifyOtp = async (req, res) => {
    try {
        // console.log(`the generated OTP : ${req.session} `)

        res.render('otp_page')

        console.log("OTP verification page loaded")

    } catch (error) {
        console.log(error.message)
    }
}



const compareOtp = async (req, res) => {
    try {
        console.log(req.body.otp)
        const otpValue = req.body.otp

        const sessionOtp = req.session.Data.otp

        console.log(`value in session data is ${sessionOtp}`)

        if (sessionOtp == otpValue) {

            console.log("OTP verified")

            res.render('home')
        } else {
            console.log("OTP not verified")
            res.render('error')
        }
    } catch (error) {
        console.log(error.message)
    }
}

// const loadHomePage = async (req, res) => {
//     try {

//     } catch (error) {

//     }
// }

module.exports = {
    loadRegister,
    insertUser,
    verifyOtp,
    compareOtp
}