const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const SALT_ROUNDS = 10
const session = require('express-session')

const pgp = require('pg-promise')();
const connectionString = 'postgres://localhost:5432/blogdb';
const db = pgp(connectionString);

router.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}))

// GET gets all the blogs
router.get('/', (req, res) => {
  db.any('SELECT blogid, title, body, datecreated FROM blogs;')
    .then(blogs => {
      res.render('blogs', {
        blogs: blogs,
        username: req.session.user.username
      })
    }).catch(error => {
      res.render('blogs', { message: 'Unable to get blogs!' })
    })
})

// POST the register information to database
router.get('/register', (req, res) => {
  res.render('register')
})

// GET gets all the blogs
router.get('/my-blogs', (req, res) => {

  let userid = req.session.user.userid

  db.any('SELECT blogid, title, body FROM blogs WHERE userid = $1', [userid])
    .then((blogs) => {
      console.log(blogs)
      res.render('my-blogs', { blogs: blogs })
    })
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
            res.redirect('/blogs')
          } else {
            res.send('render the same page and tell the user that credentials are wrong')
          }
        })
      } else {
        res.render('login', { message: "Invalid username or password!" })
      }
    })
})

// GET gets the blog create form
router.get("/create-blog", (req, res) => {
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
      res.redirect('/blogs')
    })
})

// // GET gets the update blog form
// router.get("/update-blog", (req, res) => {
//     let blogid = req.body.blogid
//     console.log(blogid)
//     db.any('SELECT blogid, title, author, body, datecreated FROM blogs WHERE blogid = $1', [blogid])
//         .then(blogs => {
//             console.log(blogs)
//             res.render('update-blog', { blogs: blogs })
//         })

//     res.render('update-blog')
// })

// router.post("/update-blog", (req, res) => {
//     let blogid = req.body.blogid
//     let title = req.body.title
//     let author = req.body.author
//     let body = req.body.body

//     db.none('UPDATE blogs SET title = $1, author = $2, body = $3, WHERE blogid = $1', [title, author, body, blogid]).then(() => {
//         res.redirect('/blogs')
//     })
// })

module.exports = router
