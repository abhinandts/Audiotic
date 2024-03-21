const User = require('../models/userModel')
const bcrypt = require('bcrypt')

const session = require('express-session')
const config = require('../config/config')

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

        const otp = generateOtp()
        console.log(`Otp generated from ${otp}`)

        const { name, email, mobile, password } = req.body
        const data = {
            name, email, mobile, password, otp
        }
        req.session.Data = data

        // const sessionotp = req.session.Data.otp
        console.log(`otp from session ${req.session.Data.otp}`)
        res.redirect('/verify_otp')

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