const http = require('http');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 8080);
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';

const leads = [];

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': FRONTEND_ORIGIN,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(body);
}

function logError(message, error, context = {}) {
  const entry = {
    level: 'error',
    timestamp: new Date().toISOString(),
    message,
    context,
    stack: error && error.stack ? error.stack : String(error)
  };
  process.stderr.write(`${JSON.stringify(entry)}\n`);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': FRONTEND_ORIGIN,
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end();
      return;
    }

    if (req.method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, { status: 'ok', env: NODE_ENV });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/leads') {
      sendJson(res, 200, { data: leads });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/leads') {
      const body = await parseBody(req);
      if (!body.name || !body.email) {
        sendJson(res, 400, { error: 'name and email are required' });
        return;
      }

      const lead = {
        id: leads.length + 1,
        name: body.name,
        email: body.email,
        createdAt: new Date().toISOString()
      };
      leads.push(lead);
      sendJson(res, 201, { data: lead });
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    logError('Unhandled request error', error, {
      method: req.method,
      url: req.url
    });
    sendJson(res, 500, { error: 'Internal server error' });
  }
});

server.listen(PORT, () => {
  process.stderr.write(`{"level":"info","message":"server_started","port":${PORT}}\n`);
});
