# Göttingen Mensa API

[![Uptime Robot status](https://img.shields.io/uptimerobot/status/m780733961-bd63dc951bbeb63695f71a10.svg?label=API)](https://stats.uptimerobot.com/r92k1tjo3)

This project aims to document and open up the API for the canteens at the University of Göttingen, Germany.

- [x] Document the official API* (`origin API`, see [Terms](#terms)) to get dishes for all canteens in Göttingen.
- [x] Define a new JSON API that wraps around the origin API
- [x] Create a Node.js wrapper to implement the JSON API.
- [x] Integrate English labels into data.
- [ ] Add unit tests.
- [ ] Extract some functionality into a npm package.

This is a supplementary project to my upcoming Göttingen Mensa Telegram bot.

\* Unfortunately, there is no officially advertised API, but if you know where to look, you can find an API that returns a preformatted HTML table that can be parsed systematically.

## JSON API Installation

To install and run the JSON API on your own device, you'll need a MongoDB server and Node.js.

```bash
# Clone repository
git clone https://github.com/stefandesu/goe-mensa-api.git
cd goe-mensa-api

# Install dependencies
npm install

# Create .env file
touch .env
# See below for more info on the .env file

# Run the dev server
npm run dev
```

`.env` example file (for defaults see `server.js`):

```
MONGO_URL=localhost
MONGO_DB=goe-mensa-api
MONGO_PORT=27017
MONGO_USER=mongoadmin
MONGO_PASS=mongopass
PORT=8123
```

## Terms
To avoid confusion (especially for myself), I'll define some terms here.

- `mensa` (plural `mensen`) = canteen(s) (I believe even most English speaking students in Göttingen use mensa/mensen and it feels way more natural)
- `dish`, `dishes` (also `side dishes`) (these are called `Gerichte` in the origin API)
- `origin API` = the "official" API
- `JSON API` = the newly defined JSON API wrapper

## Origin API Documentation

This API was found by exploring the official widget on https://ecampus.uni-goettingen.de (only available for students at University of Göttingen).

### URL
The base URL is https://phpapp2.zvw.uni-goettingen.de/portlet_mensaplan/public/ajaxresponse/getgerichte.

### Method
You can modify the response by adding `GET` parameters.

### URL Params
**Required:**

- `mensa` (canteen). Without this parameter, the API will return nothing (or rather, a completely empty table). Has to be one of: `Zentralmensa`, `Mensa am Turm`, `Nordmensa`, `Mensa Italia`, `Bistro HAWK`.

All other parameters are optional:

- `tag` (day). Has to be one of `heute` (today), `morgen` (tomorrow), `uebermorgen` (day after tomorrow). Defaults to `heute`. For `morgen` and `uebermorgen`, if there is a Sunday in between, it'll be skipped in the date calculating, e.g. on Saturday, `uebermorgen` will return data for Tuesday. There might be more options as the official website can show dishes for the current and next week.
- `preis` (price). Has to be one of `stu` (student), `mit` (employee), `gas` (guest). Defaults to `stu`.

The following parameters can all have the values `true` or `false`. All default to `true`:

- `vegetarisch` (vegetarian)
- `schweinefleisch` (pork)
- `vegan`
- `fisch` (fish/seafood)
- `gefluegel` (chicken)
- `rind` (beef/veal)
- `wild` (game meat)
- `lamm` (lamb)
- `alkohol` (alcohol)
- `knoblauch` (garlic)
- `sonstige_gerichte` (other dishes)

### Success Response

- Code: `200`
- Content-Type: `text/html`
- Content:

```html
<table id="gerichte_table">
  <tbody>
    <tr class="zeile_grau">{ or <tr>}
      <td class="spalte_kategorie">
        <div class="gericht_kategorie">
          {dish_category}
        </div>
        <div class="gericht_preis">
          {price} € für {price_type}
        </div>
      </td>
      <td class="spalte_gericht">
        <div class="gericht_titel">
          {dish_title} ({dish_additives})
        </div>
        {dish_description}
      </td>
      <td class="spalte_bild">
        {dish_image}
      </td>
    </tr>
    {...}
  </tbody>
</table>
```
Explanation:

- `{dish_category}` is one of a few preset categories for each canteen, e.g. "Menü I" or "Menü II" for Zentralmensa.
- `{price}` is the price in Euro with a comma as a decimal point.
- `{price_type}` is one of `Studenten` (students), `Mitarbeiter` (employees), `Gäste` (guests).
- `{dish_title}` is the name of the dish (can be empty, e.g. for deserts).
- `{dish_additives}` is a comma separated list of food additives (see [below](#possible-additives) for more information).
- `{dish_description}` is the description and possible side dishes (sometimes with comma-separated additives in brackets). The side dishes are mostly separated by commas, but sometimes with an `oder` (or) for example if you can choose between different sauces.
- `{dish_image}` is not an actual image of the meal, but one of these:
  - empty
  - `<img src="/portlet_mensaplan/public/images/vegetarisch.gif">` (vegetarian/vegan)
  - `<img src="/portlet_mensaplan/public/images/fisch.gif">` (fish/seafood)
  - `<img src="/portlet_mensaplan/public/images/schweinefleisch.gif">` (meat) (it says pork but is attached to all meals containing meat)
  - `<img src="/portlet_mensaplan/public/images/msc.gif">` (MSC certified sustainable seafood, [link](https://www.msc.org))
  - apparently there might also be `<img src="/portlet_mensaplan/public/images/stw-bio.gif">` for organic food

### Error Response

- Code: `200`
- Content-Type: `text/html`
- Content:

```html
<div class="meldung">
  Keine Speisen vorhanden. Bitte beachten Sie die Öffnungszeiten. Mittagsgerichte werden nur bis 14:15 angezeigt.
</div>
```
(It just says: "No dishes available. Please note the opening hours. Lunch will only be shown until 14:15.".)

### Sample Calls

- https://phpapp2.zvw.uni-goettingen.de/portlet_mensaplan/public/ajaxresponse/getgerichte?mensa=Zentralmensa&tag=morgen&preis=mit. Shows all dishes from Zentralmensa for the next day with prices for employees.

### Possible Additives

Taken from the bottom of https://www.studentenwerk-goettingen.de/speiseplan.html (German) and https://www.studentenwerk-goettingen.de/1/speiseplan.html (English):

**Additives:**

- `1` mit Konservierungsstoff / with preservative
- `2` mit Farbstoff / with couloring
- `3` mit Antioxidationsmittel / with antioxidant
- `4` mit Geschmacksverstärker / with flavour enhancer
- `5` geschwefelt / sulphurated
- `6` geschwärzt / blackened
- `7` gewachst / waxed
- `8` mit Phosphat / with phosphate
- `9` mit Süßungsmittel / sweetener/s
- `10` enthält eine Phenylalaninquelle / contains phenylalanin source
- `11` mit kakaohaltiger Fettglasur / with cocoa based coating

**Allergens:**

- `a` Glutenhaltiges Getreide / contain gluten
- `b` Krebstiere und daraus gewonnene Erzeugnisse / crustaceans and derived products
- `c` Eier und daraus gewonnene Erzeugnisse / eggs and derived products
- `d` Fische und daraus gewonnene Erzeugnisse / fish and derived products
- `e` Erdnüsse und daraus gewonnene Erzeugnisse / peanuts and derived products
- `f` Soja(bohnen) und daraus gewonnene Erzeugnisse / soybeans and derived products
- `g` Milch und daraus gewonnene Erzeugnisse / milk and derived products (including lactose)
- `h` Schalenfrüchte / edible nuts
- `i` Sellerie und daraus gewonnene Erzeugnisse / celery and derived products
- `j` Senf und daraus gewonnene Erzeugnisse / mustard and derived products
- `k` Sesamsamen und daraus gewonnene Erzeugnisse / sesame seeds and derived products
- `l` Schwefeldioxid und Sulphite / sulfur dioxid and sulphites
- `m` Lupinen und daraus gewonnene Erzeugnisse / lupines and derived products
- `n` Weichtiere und daraus gewonnene Erzeugnisse / molluscs and derived products

## JSON API Documentation

In order to work with the data more easily, we are defining and creating a JSON API around the origin API.

The JSON API is now running on https://mensa.exo.pm/api/. Currently, it'll try to load dishes data each morning for the day after next. Also note that the categories are still incomplete. If you'd like to help complete them, feel free to PR (see file `data/categories.json`).

### Canteens / Mensen

- Endpoint: `/mensen`
- Method: `GET`
- Params: None
- Content-Type: `application/json`
- Content: An array of mensa objects like

  ```json
  {
    "_id": "Zentralmensa",
    "order": 0
  }
  ```
- Explanation:

  `order` is the order in which to show the canteens (needs to be hardcoded)
- Manually compiled data can be found in `data/mensen.json`.

### Categories

- Endpoint: `/categories`
- Method: `GET`
- Params: `mensa` (id of mensa)
- Content-Type: `application/json`
- Content: An array of category objects like

  ```json
  {
    "mensa": "Zentralmensa",
    "_id": "menu1",
    "labels": ["Menü 1"],
    "type": "main",
    "order": 0,
    "hide": false
  }
  ```
- Explanation:

  `mensa` is the id of the mensa

  `_id` is a unique identifier for this category

  `labels` is an array of labels because sometimes one category can have slightly different labels

  `type` is one of `main`, `other` (might add more later)

  `order` is the order in which to show the categories (needs to be hardcoded)

  `hide` is whether this category should be hidden from subscriptions (optional, default false, up to the client whether to follow this or not)
- Manually compiled data can be found in `data/categories.json` (not complete yet, feel free to help).

### Dishes

- Endpoint: `/dishes`
- Method: `GET`
- Params: `date` (optional, in `YYYY-MM-DD`), `mensa` (optional, id of mensa), `category` (optional, id of category)
- Content-Type: `application/json`
- Content: An array of dish objects like

  ```json
  {
    "mensa": "Zentralmensa",
    "category": "menu1",
    "_id": "grc583y5vovnlwanmvt",
    "date": "2018-07-18",
    "prices": {
      "student": 2.5,
      "employee": 4.0,
      "guest": 5.0
    },
    "title": {
      "de": "Deutscher Titel",
      "en": "English title if available"
    },
    "additives": ["3", "i"],
    "description": {
      "de": "Deutsche Beschreibung bzw. Beilagen",
      "en": "English description and side dishes if available"
    },
    "type": "meat"
  }
  ```
- Explanation:

  `mensa` is the id of the mensa

  `category` is the id of the category

  `_id` is a random string

  `date` is the date for this dishes entry

  `additives` is a list of additive identifiers (see below)

  `type` is one of `meat`, `fish`, `vegetarian`, or empty

### Additives

- Endpoint: `/additives`
- Method: `GET`
- Params: `ids` (optional, comma separated list of additive ids)
- Content-Type: `application/json`
- Content: An array of additive objects like

  ```json
  {
    "_id": "a",
    "title": {
      "de": "Glutenhaltiges Getreide",
      "en": "contain gluten"
    }
  }
  ```
- Manually compiled data can be found in `data/additives.json`.

### Price Types

- Endpoint: `/priceTypes`
- Method: `GET`
- Params: None
- Content-Type: `application/json`
- Content: An array of price types like

  ```json
  {
    "_id": "mit",
    "title": {
      "de": "Mitarbeiter",
      "en": "employee"
    }
  }
