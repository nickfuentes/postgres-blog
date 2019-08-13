const express = require('express')
const router = express.Router()

const pgp = require('pg-promise')();
const connectionString = 'postgres://localhost:5432/blogdb';
const db = pgp(connectionString);

// GET shows all the blogs
router.get('/', (req, res) => {
    db.any('SELECT blogid, title, author, body, datecreated FROM blogs;')
        .then(blogs => {
            // console.log(blogs)
            res.render('blogs', { blogs: blogs })
        }).catch(error => {
            res.render('blogs', { message: 'Unable to get blogs!' })
        })
})

// GET to show the blog create form
router.get("/create-blog", (req, res) => {
    res.render("create-blog")
})

// POST the blog to the database
router.post('/create-blog', (req, res) => {
    let title = req.body.title
    let author = req.body.author
    let body = req.body.body

    db.none('INSERT INTO blogs(title, author, body) VALUES($1, $2, $3)', [title, author, body]).then(() => {
        res.redirect('/blogs')
    })
})


module.exports = router
