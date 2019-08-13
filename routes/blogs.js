const express = require('express')
const router = express.Router()


const pgp = require('pg-promise')();
const connectionString = 'postgres://localhost:5432/blogdb';
const db = pgp(connectionString);

// GET gets all the blogs
router.get('/', (req, res) => {
    db.any('SELECT blogid, title, body, datecreated FROM blogs;')
        .then(blogs => {
            console.log(blogs)
            res.render('blogs', { blogs: blogs })
        }).catch(error => {
            console.log(error)
            res.render('blogs', { message: 'Unable to get blogs!' })
        })
})

// POST the register information to database
router.get('/register', (req, res) => {
    res.render('register')
})

// POST the user username and password to users database
router.post('/register', (req, res) => {

    let username = req.body.username
    let password = req.body.password

    db.oneOrNone('SELECT userid FROM users WHERE username = $1', [username])
        .then((user) => {
            if (user) {
                res.render('register', { message: "User name already exists!" })
            } else {
                db.none('INSERT INTO users(username, password) VALUES($1, $2)', res[username, password])
                    .then(() => {
                        res.send('SUCCESS')
                    })
            }
        })
})

// GET shows the login form
router.get('/login', (req, res) => {
    res.render('login')
})

// GET gets the blog create form
router.get("/create-blog", (req, res) => {
    res.render("create-blog")
})

// POST the blog to the database
router.post('/create-blog', (req, res) => {
    let title = req.body.title
    let body = req.body.body

    db.none('INSERT INTO blogs(title, body) VALUES($1, $2)', [title, body]).then(() => {
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
