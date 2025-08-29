#!/bin/bash
# Verifica el endpoint /health de la API OTT

URL=${1:-http://localhost:3000/health}
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
if [ "$STATUS" -ne 200 ]; then
  echo "Health check falló (código $STATUS)"
  exit 1
fi

echo "Health OK"
