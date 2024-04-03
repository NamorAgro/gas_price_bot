import axios from 'axios';
import cheerio from 'cheerio';

export default async function tellJoke(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const text = $('div.text').first().text();
    return text
  } catch (error) {
    console.error(error);
  }
}

