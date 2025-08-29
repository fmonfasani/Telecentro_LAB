
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

let licensesIssued = 0;


function sendJSON(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/videos") {
    return sendJSON(res, 200, videos);
  }

  if (req.method === "GET" && url.pathname.startsWith("/videos/")) {
    const id = parseInt(url.pathname.split("/")[2]);
    const video = videos.find(v => v.id === id);
    if (!video) return sendJSON(res, 404, { error: "Video no encontrado" });
    if (video.status !== "OK") return sendJSON(res, 403, { error: "Licencia DRM inválida" });
    return sendJSON(res, 200, video);
  }

  if (req.method === "POST" && url.pathname === "/license") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const { videoId } = JSON.parse(body || "{}");
        const video = videos.find(v => v.id === videoId);
        if (!video) return sendJSON(res, 404, { error: "Video no encontrado" });
        licensesIssued++;
        return sendJSON(res, 200, { license: `LIC-${videoId}` });
      } catch {
        return sendJSON(res, 400, { error: "JSON inválido" });
      }
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/metrics") {
    const metrics = `# HELP licenses_issued_total Total licenses issued\n` +
      `# TYPE licenses_issued_total counter\n` +
      `licenses_issued_total ${licensesIssued}\n`;
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain; version=0.0.4");
    res.end(metrics);
    return;
  }

  res.statusCode = 404;
  res.end("Not found");
});

server.listen(3000, () => {
  console.log("API OTT corriendo en http://localhost:3000");
});

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

