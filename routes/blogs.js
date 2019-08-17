const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const SALT_ROUNDS = 10
const session = require('express-session')
const checkAuth = require("../utils/checkAuth")

const pgp = require('pg-promise')();
const connectionString = 'postgres://dljgyjfqozrnyn:23845841772d0bc11f7b545e70b84d35567019c97ad2d8a75e5f08db3948c27f@ec2-54-197-239-115.compute-1.amazonaws.com:5432/d3hj9jd6cp50v9'
const db = pgp(connectionString);

router.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}))

// Authinticated local to hide links if user is not logged in
router.use((req, res, next) => {
  res.locals.authenticated = req.session.user == null ? false : true
  next()
})

// GET gets all the blogs
router.get('/', (req, res) => {
  db.any('SELECT blogid, title, body, datecreated FROM blogs;')
    .then(blogs => {
      res.render('blogs', { blogs: blogs })
    }).catch(error => {
      res.render('blogs', { message: 'This is broken' })
    })
})

// POST the register information to database
router.get('/register', (req, res) => {
  res.render('register')
})

// POST the user username and password to users database with bcrypt
router.post('/register', (req, res) => {

  let username = req.body.username
  let password = req.body.password

  db.oneOrNone('SELECT userid FROM users WHERE username = $1', [username])
    .then((user) => {
      if (user) {
        res.render('register', { message: "User name already exists!" })
      } else {
        bcrypt.hash(password, SALT_ROUNDS).then(function (hash) {
          db.none('INSERT INTO users(username, password) VALUES($1, $2)', [username, hash])
            .then(() => {
              res.redirect('/blogs/login')
            })
        })
      }
    })
})

// GET shows the login form
router.get('/login', (req, res) => {
  res.render('login')
})

// POST logins user to app
router.post('/login', (req, res) => {

  let username = req.body.username
  let password = req.body.password

  db.oneOrNone('SELECT userid, username, password FROM users WHERE username = $1', [username])
    .then((user) => {
      if (user) {
        bcrypt.compare(password, user.password).then(function (result) {
          if (result) {
            if (req.session) {
              req.session.user = {
                userid: user.userid,
                username: user.username
              }
            }
            res.redirect('/blogs/my-blogs')
          } else {
            res.send('render the same page and tell the user that credentials are wrong')
          }
        })
      } else {
        res.render('login', { message: "Invalid username or password!" })
      }
    })
})

// GET gets all the blogs
router.get('/my-blogs', checkAuth, (req, res) => {

  let userid = req.session.user.userid

  db.any('SELECT blogid, title, body FROM blogs WHERE userid = $1', [userid])
    .then((blogs) => {
      res.render('my-blogs', { blogs: blogs })
    })
})

// GET gets the blog create form
router.get("/create-blog", checkAuth, (req, res) => {
  res.render("create-blog")
})

// POST the blog to the database
router.post('/create-blog', (req, res) => {
  let title = req.body.title
  let body = req.body.body
  let userid = req.session.user.userid

  db.none('INSERT INTO blogs(title, body, userid) VALUES($1, $2, $3)', [title, body, userid]).then(() => {
    res.redirect('/blogs')
  })
})

// POST deletes the blog
router.post("/delete-blog", (req, res) => {
  let blogid = req.body.blogid

  db.none('DELETE FROM blogs WHERE blogid = $1', [blogid])
    .then(() => {
      res.redirect('/blogs/my-blogs')
    })
})

// GET the params blogid of the article
router.get("/update-blog/:blogid", (req, res) => {

  let blogid = req.params.blogid

  db.one('SELECT blogid, title, body FROM blogs WHERE blogid = $1', [blogid])
    .then((blog) => {
      res.render('update-blog', blog)
    })

})

// POST updates the user blog by blogid
router.post('/update-blog', (req, res) => {

  let title = req.body.title
  let body = req.body.body
  let blogid = req.body.blogid

  db.none('UPDATE blogs SET title = $1, body = $2 WHERE blogid = $3', [title, body, blogid])
    .then(() => {
      res.redirect('/blogs/my-blogs')
    })
})

// POST updates the user blog by blogid
router.get('/logout', (req, res, next) => {

  if (req.session) {
    req.session.destroy((error) => {
      if (error) {
        next(error)
      } else {
        res.redirect('/blogs/login')
      }
    })
  }
})

module.exports = router
