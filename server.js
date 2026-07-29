// Yksinkertainen staattinen kehityspalvelin
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
// Oletusportti 8321, mutta ympäristömuuttuja voi ohittaa sen. Näin useampi
// palvelin (esim. kehitystyökalun oma) voi pyöriä yhtä aikaa rinnakkain.
const PORT = process.env.PORT || 8321;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.json': 'application/json',
};

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let file = path.normalize(path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath));
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log('http://localhost:' + PORT));
