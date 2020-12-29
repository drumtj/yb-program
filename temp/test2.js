const Apify = require('apify');
const randomUA = require('modern-random-ua');

Apify.main(async () => {
     // Set one random modern user agent for entire browser
    const browser = await Apify.launchPuppeteer({
        userAgent: randomUA.generate(),
        // stealth: true,
        // useChrome: true
    });
    const page = await browser.newPage();
    // Or you can set user agent for specific page
    // await page.setUserAgent(randomUA.get());
    await page.goto('https://www.bet365.com');
    // And work on your code here
    // await page.close();
    // await browser.close();
    await new Promise(resolve=>0);
});
