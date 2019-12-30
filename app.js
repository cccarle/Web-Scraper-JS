const { scrapeAndStoreHTML } = require('./helpers/htmlDownloader')
const { scrapeHTML } = require('./model/scrapeHTML')

const starting_url = 'https://en.wikipedia.org/wiki/Gaming'

const start = async () => {
  await scrapeAndStoreHTML(starting_url)
    .then(() => {
      scrapeHTML()
    })
    .then(() => {
      console.log('Succfully Scraped 200 html-pages for outgoing links & words')
    })
}

start()
