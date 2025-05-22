const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true, 
    defaultViewport: null,
  });

  const page = await browser.newPage();

  // Intercept all network requests
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    request.continue(); // let all requests through
  });

  page.on('response', async (response) => {
    try {
      const request = response.request();
      const url = request.url();

      if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
        console.log(`📦 API called: ${url}`);

        const responseHeaders = response.headers();
        const contentType = responseHeaders['content-type'] || '';

        if (contentType.includes('application/json')) {
          const json = await response.json();
          console.log('json: ', json);
          console.log('✅ Response JSON:', JSON.stringify(json, null, 2));

          // Save to a file (optional)
          fs.writeFileSync('api_response.json', JSON.stringify(json, null, 2));
        }
      }
    } catch (err) {
      console.error('❌ Error parsing response:', err.message);
    }
  });

  const targetUrl = 'https://developer.adzuna.com/jobs';
  await page.goto(targetUrl, { waitUntil: 'networkidle2' });

  // Wait for page to finish rendering (optional)
  // await new Promise(resolve => setTimeout(resolve, 5000));

  await browser.close();
})();
