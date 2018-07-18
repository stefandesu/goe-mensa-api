var rp = require("request-promise")
var cheerio = require("cheerio")

const baseUri = "https://phpapp2.zvw.uni-goettingen.de/portlet_mensaplan/public/ajaxresponse/getgerichte?tag=morgen"

// TODO: - Move this elsewhere?
const dishTypes = {
  "/portlet_mensaplan/public/images/vegetarisch.gif": "vegetarian",
  "/portlet_mensaplan/public/images/fisch.gif": "fish",
  "/portlet_mensaplan/public/images/schweinefleisch.gif": "meat",
  "/portlet_mensaplan/public/images/msc.gif": "fish",
  "/portlet_mensaplan/public/images/stw-bio.gif": "organic"
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
        let uri = baseUri + "&mensa=" + mensa._id + "&preis=" + priceType._id
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
    // Date as ISO string
    let date = (new Date()).toISOString().substring(0, 10)
    // Results consist of request data for cheerio
    for (let { $, mensa, priceType } of results) {
      $("tr").each((index, element) => {
        let dishCategory, price, dishTitleAll, dishTitleMatch, dishTitle, dishAdditives, dishDescription, dishImage
        // Category text
        dishCategory = $(element).find(".gericht_kategorie").text()
        // Price
        price = $(element).find(".gericht_preis").text().match(/(.*) €.*/)[1]
        // Dish title
        dishTitleAll = $(element).find(".gericht_titel").text()
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
        // FIXME: This seems sketchy...
        dishDescription = $(element).find(".spalte_gericht").contents().get(0).next.data
        // TODO: - dishImage
        dishImage = $(element).find(".spalte_bild").find("img").attr("src")
        // Build JSON for every dish where a category match could be found
        let category = categories.find(element => {
          return element.labels.includes(dishCategory)
        })
        // Parse Price
        let priceFloat = parseFloat(price.replace(",", "."))
        // Only continue if category could be found and price could be parsed
        if (category && priceFloat) {
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
              date,
              prices: {
                [priceType._id]: priceFloat
              },
              title: {
                de: dishTitle,
                en: null
              },
              additives: dishAdditives.split(","),
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
    console.log(dishes)
    // TODO: Save dishes to database or update if dish already exists
  })
}

module.exports.loadDishes = loadDishes