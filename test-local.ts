import http from 'http';

http.get('http://localhost:3000/api/projects', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(`BODY: ${data}`));
}).on('error', (e) => {
  console.error(`ERROR: ${e.message}`);
});
