const mensen = require("./mensen")
const categories = require("./categories")
const additives = require("./additives")

module.exports = function(app, db) {
  mensen(app, db)
  categories(app, db)
  additives(app, db)
}