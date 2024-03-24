const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

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

// ---- User registration ------------------------

const insertUser = async (req, res) => {
    try {
        let sendVerifyMailRes

        const otp = generateOtp()
        console.log(`Otp generated from ${otp}`)

        const { name, email, mobile, password } = req.body
        const data = {
            name, email, mobile, password, otp
        }
        console.log(data)
        req.session.Data = data


        if (data) {
            sendVerifyMailRes = sendVerifyMail(req.session.Data.name, req.session.Data.email, req.session.Data.otp)
            if (sendVerifyMailRes) {
                console.log("email true")
            }
            else {
                console.log("email false");
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
        res.render('otp_page')
    } catch (error) {
        console.log(error.message)
    }
}


const compareOtp = async (req, res) => {
    try {
        const otpValue = req.body.otp

        const sessionOtp = req.session.Data.otp

        if (sessionOtp == otpValue) {

            const userData = await req.session.Data
            const user = new User(userData)

            await user.save()

            res.render('home')
        } else {
            res.render('error')
        }
    } catch (error) {
        console.log(error.message)
    }
}


// ---- user login -------------------------------

const loadLogin = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message)
    }
}

const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        const data = {
            email, password,
        }
        console.log(data)

        const userData = await User.findOne({ email: email })
        console.log(userData)

        if (userData) {
            if (data.password === userData.password) {
                res.redirect('/home')
            } else {
                res.render('login', { message: 'Password is not matching' })
            }

        } else {
            console.log("no user found")
            res.render('login', { message: 'No users found with the email. please re-enter email' })

        }
    } catch (error) {
        console.log(error.message)
    }
}

const loadHome = async (req, res) => {
    try {
        res.render('home')
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadRegister,
    insertUser,
    verifyOtp,
    compareOtp,
    loadLogin,
    verifyLogin,
    loadHome,
}