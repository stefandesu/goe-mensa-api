let collection = "dishes"

/**
 * Returns dishes.
 *
 * @param {object} db
 * @param {string} date - date in YYYY-MM-DD
 * @param {string} mensa
 * @param {string} category
 *
 * @returns {Promise} with an array of dishes
 */
const getDishes = (db, date, mensa, category) => {
  let query = {}
  if (date) {
    query.date = date
  }
  if (mensa) {
    query.mensa = mensa
  }
  if (category) {
    query.category = category
  }
  return db.collection(collection).find(query).toArray()
}

/**
 * Saves or updates dishes in the datebase.
 *
 * @param {object} db
 * @param {array} dishes
 */
const saveDishes = (db, dishes) => {
  for (let dish of dishes) {
    let query = {
      date: dish.date,
      mensa: dish.mensa,
      category: dish.category
    }
    db.collection(collection).update(query, dish, { upsert : true })
  }
}

module.exports = {
  getDishes,
  saveDishes
}