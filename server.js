const express = require("express")
const mongoClient = require("mongodb").MongoClient
const app = express()
require("dotenv").config()

const
  port = process.env.PORT || 8123,
  mongoUrl = process.env.MONGO_URL || "localhost",
  mongoDb = process.env.MONGO_DB || "goe-mensa-api",
  mongoPort = process.env.MONGO_PORT || 27017,
  mongoUser = process.env.MONGO_USER,
  mongoPass = process.env.MONGO_PASS,
  mongoAuthString = mongoUser ? `${mongoUser}:${mongoPass}@` : "",
  mongoConnectUrl = `mongodb://${mongoAuthString}${mongoUrl}:${mongoPort}`

// Add default headers
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Content-Type", "application/json")
  next()
})

mongoClient.connect(mongoConnectUrl, (error, database) => {
  if (error) return console.log(error)
  const db = database.db(mongoDb)
  require("./routes")(app, db)
  app.listen(port, () => {
    console.log("Server is running on port", port)
  })
})