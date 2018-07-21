const path = require("path")

module.exports = function(app) {
  app.get("/", function(req, res) {
    res.setHeader("Content-Type", "text/html")
    res.sendFile(path.join(__dirname + "/../index.html"))
  })
}