const express = require("express")
const mongoClient = require("mongodb").MongoClient
const app = express()
const schedule = require("node-schedule")
const originApi = require("./lib/origin-api")
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

mongoClient.connect(mongoConnectUrl).then(database => {
  const db = database.db(mongoDb)
  // Prepare database
  db.collection("dishes").createIndex({ date: 1, mensa: 1, category: 1 }, { unique: true })
  return db
}).then(db => {
  require("./routes")(app, db)
  app.listen(port, () => {
    console.log("Server is running on port", port)
  })
  // Schedule loading mensa data from origin API
  schedule.scheduleJob("0 6,7,8 * * *", () => {
    originApi.loadDishes(db)
  })
}).catch(error => {
  console.log("Error:", error)
})