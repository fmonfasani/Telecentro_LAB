#!/bin/bash
# Ejecuta distintos escenarios de fallas en la API OTT

DIR="$(dirname "$0")"

echo "Escenario DRM:"
"$DIR/incident_drm_failure.sh"

echo "Escenario video no encontrado:"
"$DIR/incident_video_not_found.sh"

echo "Escenario DB:"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/simulate-db-error

echo "Escenario CDN:"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/simulate-cdn-error

echo "Escenario API:"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/simulate-api-error
