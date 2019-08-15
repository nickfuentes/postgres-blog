function checkAuth(req, res, next) {

    if (req.session) {

        if (req.session.user) {
            next()
        } else {
            res.redirect("/blogs/login")
        }

    } else {
        res.redirect("/blogs/login")
    }

}

module.exports = checkAuth