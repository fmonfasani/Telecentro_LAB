#!/bin/bash
# Basado en incident_scenarios.sh
# Simula una solicitud a un video con error de DRM

ID=3
echo "Solicitando video con ID $ID (espera 403)"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/videos/$ID
