const Admin = require('../models/adminModel')
const User = require('../models/userModel')
const mongoose = require('mongoose')

//---- /login -----------------------------------------

const loadLogin = async (req, res) => {
    try {
        res.render('login', {
            title: 'Admin login',
            header: false,
            sidebar: false,
            footer: false
        })
        console.log("admin login Page loaded")
    } catch (error) {
        console.log(error.message)
    }
}

const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        const data = { email, password }

        const adminData = await Admin.findOne({ email: email }).catch(error => {
            console.error("Error querying database:", error);
        });

        if (adminData) {
            if (data.password === adminData.password) {
                res.redirect('/admin/dashboard')
            } else {
                res.render('login', { message: 'Password is incorrect' })
            }

        } else {
            res.render('adminlogin', { message: 'invalid ' })
        }
    } catch (error) {
        console.log(error.message)
    }
}

// ---- /dashboard -----------------------------------------

const loadDashboard = async (req, res) => {
    try {
        res.render('dashboard', { title: 'Admin Dashboard', header: true, sidebar: true, footer: true })
    } catch (error) {
        console.log(error.message)
    }
}

// ---- /users -----------------------------

const loadUsers = async (req, res) => {
    try {
        const userData = await User.find()

        res.render('users', { title: 'Users', header: true, sidebar: true, footer: true, userData })
    } catch (error) {
        console.log(error.message)
    }
}

// ---- /blockUser & /unblockUser -----------------

const blockUser = async (req, res) => {

    const userId = req.params.userId
    console.log(userId)
    try {
        await User.findByIdAndUpdate(userId, { $set: { is_active: false } })

        res.redirect('/admin/users')

    } catch (error) {
        console.log(error.message)
    }
}

const unblockUser = async (req, res) => {
    const userId = req.params.userId
    try {
        await User.findByIdAndUpdate(userId, { $set: { is_active: true } })

        res.redirect('/admin/users')

    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    loadUsers,
    blockUser,
    unblockUser,
    // products,
    // newProduct,
}