import puppeteer from 'puppeteer';

export default async function findDynamicH1Title() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://baltic.transparency-dashboard.eu/');
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const h1TitleText = await page.evaluate(() => {
        const h1 = document.querySelector('.current-value');
        const result = h1.innerText.match(/-?\d+(\.\d+)?/);
      return h1 ? Number(result[0]) : '';
      });
    
      await browser.close();
      return h1TitleText
}
