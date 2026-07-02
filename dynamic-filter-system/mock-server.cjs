const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'src/data/employees.json');

const server = http.createServer((req, res) => {
  if (req.url === '/api/employees') {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unable to read employee data' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route not found' }));
});

server.listen(PORT, () => {
  console.log(`Mock API running at http://localhost:${PORT}/api/employees`);
});
