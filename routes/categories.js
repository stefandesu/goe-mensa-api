const collection = "categories"

module.exports = function(app, db) {
  app.get("/categories", (req, res) => {
    let query = {}
    if (req.query.mensa) {
      query.mensa = req.query.mensa
    }
    db.collection(collection).find(query)
      .toArray()
      .then(results => {
        res.json(results)
      })
  })
}