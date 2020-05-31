const https = require("https")
const http = require("http")

const scraper = {}


/**
  @arg         url The url to scrape
  @callback    the callback function to handle the received chunk
  @args        extra arguments provided to the function
  @description 
  Scrapes HTML chunk for a HTTPS site
  Basic example:
  ```js
    scraper.scrapeHTTPS("https", (chunk) => {
      console.log(chunk) // prints the chunk to the log
    })
  ```
*/
scraper.scrapeHTTPS = (url, callback, ...args) => {
  let data = ""
  https.get(url, res => {
    res.on("data", (chunk) => {
      data += chunk
    })
    res.on("end", () => {
      callback(data, ...args)
    })
    
  }).on("error", (err) => {
    throw new Error(err)
  })
}

scraper.scrapeHTTP = (url, callback, ...args) => {
  let data = ""
  http.get(url, res => {
    res.on("data", (chunk) => {
      data += chunk
    })
    res.on("end", () => {
      callback(data, ...args)
    })
  }).on("error", (err) => {
    throw new Error(err)
  })
}

module.exports = scraper
