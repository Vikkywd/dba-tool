const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.freejobalert.com/engineering-jobs/';

if (!url) {
  console.error('❌ Please provide a URL:');
  console.error('Example: node jobScraper.js https://example.com/jobs');
  process.exit(1);
}

(async () => {
  try {
    console.log(`🔍 Scraping job data from: ${url}`);
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const jobs = [];

    // ✨ Change these selectors based on the site's structure
    $('.job-listing, .job, .job-card').each((_, el) => {
      const jobTitle = $(el).find('.title, .job-title, h2').text().trim();
      const company = $(el).find('.company, .job-company').text().trim();
      const location = $(el).find('.location, .job-location').text().trim();
      const date = $(el).find('.date, .posted-date').text().trim();
      const link = $(el).find('a').attr('href');

      if (jobTitle) {
        jobs.push({
          jobTitle,
          company,
          location,
          date,
          link: link?.startsWith('http') ? link : `${url}${link}`
        });
      }
    });

    if (jobs.length === 0) {
      console.log('❌ No jobs found. Try updating the selectors based on website structure.');
    } else {
      console.log(`✅ Found ${jobs.length} job(s):`);
      console.log(jobs.slice(0, 10)); // preview
    }

  } catch (error) {
    console.error('❌ Error fetching or parsing:', error.message);
  }
})();
