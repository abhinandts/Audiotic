const isLogin = async (req, res, next) => {
    try {
        console.log(req.session)
        if (req.session.adminId) {
            next();
        } else {
            res.redirect('/admin/login')
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    isLogin
}