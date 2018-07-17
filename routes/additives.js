const collection = "additives"

module.exports = function(app, db) {
  app.get("/additives", (req, res) => {
    let query = {}
    if (req.query.ids) {
      query = {
        $or: req.query.ids.split(",").map(id => ({ _id: id }))
      }
    }
    db.collection(collection).find(query)
      .toArray()
      .then(results => {
        res.json(results)
      })
  })
}