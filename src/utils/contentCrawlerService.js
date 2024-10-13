const axios = require('axios');
const cheerio = require('cheerio');

async function crawlContent(url) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  return $('body').text(); 
}

module.exports = { crawlContent };


