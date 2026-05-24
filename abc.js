const https = require('https');
https.get('https://earthobservatory.nasa.gov/features/ABC', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    require('fs').writeFileSync('d:/cosmic/abc.html', data);
  });
});
