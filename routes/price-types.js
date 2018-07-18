const collection = "price-types"

module.exports = function(app, db) {
  app.get("/priceTypes", (req, res) => {
    db.collection(collection).find()
      .toArray()
      .then(results => {
        res.json(results)
      })
  })
}