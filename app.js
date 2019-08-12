const express = require("express")
const app = express()

const mustacheExpress = require("mustache-express")

const blogsRouter = require('./routes/blogs')

app.use(express.urlencoded({ extended: false }))

app.engine("mustache", mustacheExpress())
app.set("views", "./views")
app.set("view engine", "mustache")

app.use("/blogs", blogsRouter)

app.listen(3000, () => {
    console.log("Hey Nick the server is running...")
})