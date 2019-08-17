const express = require("express")
const app = express()
const path = require('path')
const PORT = process.env.PORT || 8000;

const mustacheExpress = require("mustache-express")

const blogsRouter = require('./routes/blogs')

app.use(express.urlencoded({ extended: false }))

const VIEWS_PATH = path.join(__dirname, '/views')

app.use("/css", express.static(__dirname + '/css'))

app.engine("mustache", mustacheExpress(VIEWS_PATH + '/partials', '.mustache'))
app.set("views", VIEWS_PATH)
app.set("view engine", "mustache")

app.use("/blogs", blogsRouter)

app.listen(PORT, () => {
    console.log("Hey Nick the server is running...")
})