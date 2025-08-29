const express = require("express");
const fs = require("fs");
const client = require("prom-client");

const app = express();
app.use(express.json());

// Métricas de Prometheus
const register = new client.Registry();
client.collectDefaultMetrics({ register });
const drmErrorCounter = new client.Counter({
  name: "drm_error_total",
  help: "Total de errores de licencia DRM",
});
register.registerMetric(drmErrorCounter);

// Cargar videos desde archivo
const videos = JSON.parse(fs.readFileSync("videos.json", "utf-8"));

// Obtener todos los videos
app.get("/videos", (req, res) => res.json(videos));

// Simular DRM fallando
app.get("/videos/:id", (req, res) => {
  const video = videos.find(v => v.id === parseInt(req.params.id));
  if (!video) return res.status(404).json({ error: "Video no encontrado" });
  if (video.status !== "OK") {
    drmErrorCounter.inc();
    return res.status(403).json({ error: "Licencia DRM inválida" });
  }
  res.json(video);
});

// Endpoint de métricas
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(3000, () => console.log("API OTT corriendo en http://localhost:3000"));
