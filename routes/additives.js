const collection = "additives"

module.exports = function(app, db) {
  app.get("/additives", (req, res) => {
    db.collection(collection).find()
      .toArray()
      .then(results => {
        res.json(results)
      })
  })
}