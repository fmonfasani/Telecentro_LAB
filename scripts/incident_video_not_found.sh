#!/bin/bash
# Basado en incident_scenarios.sh
# Simula solicitud de un video inexistente

ID=999
echo "Solicitando video con ID $ID (espera 404)"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/videos/$ID
