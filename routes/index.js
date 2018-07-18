const mensen = require("./mensen")
const categories = require("./categories")
const additives = require("./additives")
const priceTypes = require("./price-types")

module.exports = function(app, db) {
  mensen(app, db)
  categories(app, db)
  additives(app, db)
  priceTypes(app, db)
}