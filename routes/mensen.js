const collection = "mensen"

module.exports = function(app, db) {
  app.get("/mensen", (req, res) => {
    db.collection(collection).find()
      .toArray()
      .then(results => {
        res.json(results)
      })
  })
}