const isLogin = async (req, res, next) => {
    try {
        if (req.session.admin) {
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