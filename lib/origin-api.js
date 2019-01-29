var rp = require("request-promise")
var cheerio = require("cheerio")
let dishesDb = require("./dishes")

// Load data for the day after next
const baseUri = "https://www.studentenwerk-goettingen.de/fileadmin/templates/php/mensaspeiseplan/cached/{{language}}/{{date}}/{{mensa}}.html"

// Date as ISO string
function date() {
  let currentDate = new Date()
  currentDate.setDate(currentDate.getDate() + 2)
  // If there is a Sunday in between, add one more day
  if (currentDate.getDay() <= 1) {
    currentDate.setDate(currentDate.getDate() + 1)
  }
  return currentDate.toISOString().substring(0, 10)
}

// TODO: - Move this elsewhere?
const dishTypes = {
  "/fileadmin/templates/images/mensaspeiseplan/png/vegetarisch.png": "vegetarian",
  "/fileadmin/templates/images/mensaspeiseplan/png/vegan.png": "vegan",
  "/fileadmin/templates/images/mensaspeiseplan/png/fisch.png": "fish",
  "/fileadmin/templates/images/mensaspeiseplan/png/fleisch.png": "meat",
  "/fileadmin/templates/images/mensaspeiseplan/png/msc.png": "fish",
  "/fileadmin/templates/images/mensaspeiseplan/png/bio.png": "organic"
}

const loadDishes = (db) => {
  let mensen, categories, priceTypes
  // Load mensen, categories, and priceTypes from database
  Promise.resolve().then(() => {
    // 1. Load mensen
    return db.collection("mensen").find().toArray()
  }).then(results => {
    mensen = results
    return db.collection("categories").find().toArray()
  }).then(results => {
    categories = results
    return db.collection("price-types").find().toArray()
  }).then(results => {
    priceTypes = results
    let promises = []
    console.log("Mensen:", mensen.length)
    console.log("Categories:", categories.length)
    console.log("Price Types:", priceTypes.length)
    for (let mensa of mensen) {
      for (let priceType of priceTypes) {
        let uri = baseUri.replace("{{language}}", "de").replace("{{date}}", date()).replace("{{mensa}}", mensa._id.toLowerCase().split(" ").join("_"))
        promises.push(rp({
          uri,
          transform: body => cheerio.load(body)
        }).then($ => {
          return {
            $, mensa, priceType
          }
        }))
      }
    }

    return Promise.all(promises)
  }).then(results => {
    let dishes = []
    // Results consist of request data for cheerio
    for (let { $, mensa, priceType } of results) {
      $("tr[class=odd],tr[class=even]").each((index, element) => {
        let dishCategory, price, dishTitleAll, dishTitleMatch, dishTitle, dishAdditives, dishDescription, dishImage
        // Category text
        dishCategory = $(element).find(".sp_typ").text()
        // Price
        // price = $(element).find(".gericht_preis").text().match(/(.*) €.*/)[1]
        price = null
        // Dish title
        dishTitleAll = $(element).find(".sp_bez strong").text()
        dishTitleMatch = dishTitleAll.match(/(.*) \((.*)\)/)
        if (!dishTitleMatch) {
          // Does not contain additives
          dishAdditives = ""
          dishTitle = dishTitleAll
        } else {
          dishTitle = dishTitleMatch[1]
          dishAdditives = dishTitleMatch[2]
        }
        // Dish description
        dishDescription = $(element).find(".sp_bez").text().replace(/(<strong>.*<\/strong>)+(<br>)+/, "")
        // TODO: - dishImage
        dishImage = $(element).find(".sp_hin").find("img").attr("src")
        // Build JSON for every dish where a category match could be found
        let category = categories.find(element => {
          return element.labels.includes(dishCategory) && element.mensa == mensa._id
        })
        // Parse Price
        let priceFloat = parseFloat(price && price.replace(",", "."))
        // Only continue if category could be found and price could be parsed
        if (category) {
          // See if dish already exist, if yes only update price
          let dish = dishes.find(dish => {
            return dish.mensa == mensa._id && dish.category == category._id
          })
          if (dish) {
            // Only set price
            dish.prices[priceType._id] = priceFloat
          } else {
            // Assemble JSON and save
            dish = {
              mensa: mensa._id,
              category: category._id,
              date: date(),
              prices: {
                [priceType._id]: priceFloat
              },
              title: {
                de: dishTitle,
                en: null
              },
              additives: dishAdditives.split(",").filter(additive => additive != ""),
              description: {
                de: dishDescription,
                en: null
              },
              type: dishTypes[dishImage]
            }
            dishes.push(dish)
          }
        }
      })
    }
    console.log("", dishes.length, "dishes loaded for", date())
    // Save dishes to database
    dishesDb.saveDishes(db, dishes)
  })
}

module.exports.loadDishes = loadDishes