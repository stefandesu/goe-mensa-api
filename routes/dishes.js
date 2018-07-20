let dishes = require("../lib/dishes")

module.exports = function(app, db) {
  app.get("/dishes", (req, res) => {
    dishes.getDishes(db, req.query.date, req.query.mensa, req.query.category).then(results => {
      res.json(results)
    })
  })
}