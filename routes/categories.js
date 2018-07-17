const collection = "categories"

module.exports = function(app, db) {
  app.get("/categories", (req, res) => {
    db.collection(collection).find()
      .toArray()
      .then(results => {
        res.json(results)
      })
  })
}