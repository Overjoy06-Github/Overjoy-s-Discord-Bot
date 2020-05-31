const scraper = require("./scraper.js")
// Fucking API doesn't tell me where to put the username.
scraper.scrapeHTTPS("https://api.roblox.com/users/121534164/friends", (chunk) => {
  console.log(JSON.parse(chunk))
  console.log()
})
