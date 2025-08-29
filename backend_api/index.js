const express = require("express");
const app = express();
app.use(express.json());

const videos = [
  { id: 1, title: "Película A", drm: "Widevine", status: "OK" },
  { id: 2, title: "Serie B", drm: "FairPlay", status: "OK" },
  { id: 3, title: "Documental C", drm: "PlayReady", status: "ERROR DRM" },
];

// Obtener todos los videos
app.get("/videos", (req, res) => res.json(videos));

// Simular DRM fallando
app.get("/videos/:id", (req, res) => {
  const video = videos.find(v => v.id === parseInt(req.params.id));
  if (!video) return res.status(404).json({ error: "Video no encontrado" });
  if (video.status !== "OK") return res.status(403).json({ error: "Licencia DRM inválida" });
  res.json(video);
});

app.listen(3000, () => console.log("API OTT corriendo en http://localhost:3000"));
