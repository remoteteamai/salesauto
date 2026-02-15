const http = require('http');

const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const HOST = process.env.HOST || '0.0.0.0';

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', environment: NODE_ENV }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      message: 'SalesAuto backend is running',
      environment: NODE_ENV,
    }),
  );
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT} (${NODE_ENV})`);
});
