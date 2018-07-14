# Göttingen Mensa API

This project aims to document and open up the API for the canteens at the University of Göttingen, Germany.

- [ ] Document the official API* to get dishes for all canteens in Göttingen.
- [ ] Create a Node.js wrapper around the API that returns proper JSON data.
- [ ] Make it available as a npm package.

This is a supplementary project to my upcoming Göttingen Mensa Telegram bot.

\* Unfortunately, there is no officially advertised API, but if you know where to look, you can find an API that returns a preformatted HTML table that can be parsed systematically.

## Terms
To avoid confusion (especially for myself), I'll define some terms here.

- `mensa` (plural `mensen`) = canteen(s) (I believe even most English speaking students in Göttingen use mensa/mensen and it feels way more natural)
- `dish`, `dishes` (also `side dishes`) (these are called `Gerichte` in the origin API)
- `origin API` = the "official" API
- `API` = the newly defined API wrapper

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

- `tag` (day). Has to be one of `heute` (today), `morgen` (tomorrow), `uebermorgen` (day after tomorrow). Defaults to `heute`. If the next day is a Sunday, `morgen` returns meals for Monday. There might be more options as the official website can show dishes for the current and next week.
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
- `{dish_additives}` is a comma separated list of food additives (see further below for more information).
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

Taken from the bottom of https://www.studentenwerk-goettingen.de/speiseplan.html (TODO: translation):

**Additives:**

- `1` mit Konservierungsstoff
- `2` mit Farbstoff
- `3` mit Antioxidationsmittel
- `4` mit Geschmacksverstärker
- `5` geschwefelt
- `6` geschwärzt
- `7` gewachst
- `8` mit Phosphat
- `9` mit Süßungsmittel
- `10` enthält eine Phenylalaninquelle
- `11` mit kakaohaltiger Fettglasur

**Allergens:**

- `a` Glutenhaltiges Getreide
- `b` Krebstiere und daraus gewonnene Erzeugnisse
- `c` Eier und daraus gewonnene Erzeugnisse
- `d` Fische und daraus gewonnene Erzeugnisse
- `e` Erdnüsse und daraus gewonnene Erzeugnisse
- `f` Soja(bohnen) und daraus gewonnene Erzeugnisse
- `g` Milch und daraus gewonnene Erzeugnisse
- `h` Schalenfrüchte
- `i` Sellerie und daraus gewonnene Erzeugnisse
- `j` Senf und daraus gewonnene Erzeugnisse
- `k` Sesamsamen und daraus gewonnene Erzeugnisse
- `l` Schwefeldioxid und Sulphite
- `m` Lupinen und daraus gewonnene Erzeugnisse
- `n` Weichtiere und daraus gewonnene Erzeugnisse

