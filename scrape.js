const https = require('https');

https.get('https://science.nasa.gov/mission/landsat/outreach/your-name-in-landsat/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const urls = data.match(/https:\/\/[^"']+\.jpg/g);
    if (urls) {
      console.log("Found some jpgs:", urls.slice(0, 10));
    } else {
      console.log("No jpgs found");
    }
  });
});
