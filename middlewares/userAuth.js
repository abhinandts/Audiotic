const User = require('../models/userModel')
const isLoggedIn = (req, res, next) => {
    try {
        // console.log(req.session)
        if (req.session.userId) {
            next()
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const isLoggedOut = (req, res, next) => {
    try {
        if (!req.session.userId) {
            next()
        } else {
            res.redirect('/home');
        }

    } catch (error) {
        console.log(error.message)
    }
}

// const checkUserBlocked = async (req, res, next) => {
//     let value = req.session.userId


//     const blocked = await User.findById(value)

//     if (!blocked.is_active) {
//         next()
//     } else {
//         res.render('login', { breadcrumb: "Log in", header: false, smallHeader: true, footer: false, message: 'You are blocked. please contact our customer service.', })
//     }
// }

const checkUserBlocked = async (req, res, next) => {
    const userId = req.session.userId;

    try {
        const user = await User.findById(userId);
        if (user && !user.is_active) {
            res.render('login', {
                breadcrumb: "Log in",
                header: false,
                smallHeader: true,
                footer: false,
                message: 'You have been blocked. Please contact our customer service.',
            });
            req.session.userId=""
        } else {
            next();
        }
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

    
module.exports = {
    isLoggedIn,
    isLoggedOut,
    checkUserBlocked
}