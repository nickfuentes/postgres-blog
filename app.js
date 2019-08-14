const express = require("express")
const app = express()
const path = require('path')

const mustacheExpress = require("mustache-express")

const blogsRouter = require('./routes/blogs')

app.use(express.urlencoded({ extended: false }))

const VIEWS_PATH = path.join(__dirname, '/views')


app.engine("mustache", mustacheExpress(VIEWS_PATH + '/partials', '.mustache'))
app.set("views", VIEWS_PATH)
app.set("view engine", "mustache")

app.use("/blogs", blogsRouter)

app.listen(3000, () => {
    console.log("Hey Nick the server is running...")
})