const http = require("http");

const videos = [
  { id: 1, title: "Película A", drm: "Widevine", status: "OK" },
  { id: 2, title: "Serie B", drm: "FairPlay", status: "OK" },
  { id: 3, title: "Documental C", drm: "PlayReady", status: "ERROR DRM" },
];

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
