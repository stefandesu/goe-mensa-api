const mensen = require("./mensen")
const categories = require("./categories")
const additives = require("./additives")
const priceTypes = require("./price-types")
const dishes = require("./dishes")
const base = require("./base")

module.exports = function(app, db) {
  mensen(app, db)
  categories(app, db)
  additives(app, db)
  priceTypes(app, db)
  dishes(app, db)
  base(app, db)
}