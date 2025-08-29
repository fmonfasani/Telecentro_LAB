const express = require('express');
const fs = require('fs');
const client = require('prom-client');

const app = express();
app.use(express.json());

// Prometheus metrics setup
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const drmFailuresCounter = new client.Counter({
  name: 'drm_failures_total',
  help: 'Total number of DRM license failures'
});

const cdnLatencyHistogram = new client.Histogram({
  name: 'cdn_latency_seconds',
  help: 'Latency for CDN asset delivery in seconds',
  labelNames: ['asset'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

register.registerMetric(httpRequestCounter);
register.registerMetric(drmFailuresCounter);
register.registerMetric(cdnLatencyHistogram);

// Middleware to count HTTP requests
app.use((req, res, next) => {
  res.on('finish', () => {
    const route = req.route ? req.route.path : req.originalUrl;
    httpRequestCounter.labels(req.method, route, res.statusCode).inc();
  });
  next();
});

// Load videos data
const videos = JSON.parse(fs.readFileSync('videos.json', 'utf-8'));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/videos', (req, res) => {
  res.json(videos);
});

app.get('/videos/:id', (req, res) => {
  const video = videos.find(v => v.id === parseInt(req.params.id));
  if (!video) return res.status(404).json({ error: 'Video no encontrado' });
  if (video.status !== 'OK') {
    drmFailuresCounter.inc();
    return res.status(403).json({ error: 'Licencia DRM inválida' });
  }
  res.json(video);
});

app.post('/license', (req, res) => {
  const { videoId } = req.body || {};
  const video = videos.find(v => v.id === videoId);
  if (!video) return res.status(404).json({ error: 'Video no encontrado' });
  res.json({ license: `LIC-${videoId}` });
});

app.get('/cdn/:asset', (req, res) => {
  const end = cdnLatencyHistogram.labels(req.params.asset).startTimer();
  // Simulate asset delivery
  res.json({ asset: req.params.asset });
  end();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/faults', (req, res) => {
  drmFailuresCounter.inc();
  res.status(500).json({ error: 'Fallo simulado' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API OTT corriendo en http://localhost:${port}`);
});
