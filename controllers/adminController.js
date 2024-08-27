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
                req.session.admin = true
                console.log("admin session stored")
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

        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const skip = (page -1)*limit;

        const totalUsers = await User.countDocuments();
        const totalPages = Math.ceil(totalUsers/limit)

        const userData = await User.find().sort({_id:-1}).skip(skip).limit(limit);

        res.render('users', { title: 'Users', header: true, sidebar: true, footer: true, userData,currentPage:page,totalPages:totalPages });
    } catch (error) {
        console.log(error.message)
    }
}

// ---- /blockUser & /unblockUser -----------------

const blockUser = async (req, res) => {

    const userId = req.params.userId
    console.log(userId)
    try {
        const user = await User.findById(userId)

        if (user.is_active) {
            await User.findByIdAndUpdate(userId, { $set: { is_active: false } })

            res.redirect('/admin/users')
        } else {
            await User.findByIdAndUpdate(userId, { $set: { is_active: true } })

            res.redirect('/admin/users')
        }

    } catch (error) {
        console.log(error.message)
    }
}

// ---- /logOut ----

const logOut = async (req, res) => {
    try {
        req.session.admin = false
        console.log("admin session destroyed")
        console.log(req.session)
        res.redirect('/admin/login')

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
    logOut
}