# Telecentro LAB

## Requisitos
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Puesta en marcha
1. Clona este repositorio.
2. En la raíz del proyecto ejecuta:
   ```bash
   docker compose up
   ```
   Esto levanta la API en `http://localhost:3000` junto con MySQL, MongoDB, Prometheus, Grafana, Kibana y Zabbix.
3. Para detener los servicios usa `Ctrl+C` o ejecuta `docker compose down` en otra terminal.

## Endpoints principales
- **GET /videos**: lista el catálogo de videos.
- **GET /videos/:id**: obtiene un video específico. Devuelve `403` si la licencia DRM es inválida y `404` si no existe.
- **POST /license**: solicita una licencia enviando `{ "videoId": <id> }`.
- **GET /metrics**: expone métricas en formato Prometheus.

## Ejemplo de métricas
```text
# HELP licenses_issued_total Total licenses issued
# TYPE licenses_issued_total counter
licenses_issued_total 0
# HELP drm_error_total Total de errores de licencia DRM
# TYPE drm_error_total counter
drm_error_total 0
```

## Scripts útiles
- `scripts/check_cpu.sh`: chequeo de salud que muestra el uso de CPU.
- `scripts/incident_drm_failure.sh`: simula un error de DRM (`403`).
- `scripts/incident_video_not_found.sh`: simula solicitud de video inexistente (`404`).

Ejecuta los scripts con:
```bash
./scripts/check_cpu.sh
./scripts/incident_drm_failure.sh
./scripts/incident_video_not_found.sh
```

