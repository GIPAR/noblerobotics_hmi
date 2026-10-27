#!/bin/bash
set -e

source /opt/ros/jazzy/setup.bash
export ROS_DOMAIN_ID=77

echo "Inicializando a Renovação da Certificação..."
certbot renew --config-dir $HOME/certs/config --work-dir $HOME/certs/work --logs-dir $HOME/certs/logs || echo "Falha na Certificação, Continuando o Script..."

echo "Inicializando a ponte com o ROS2..."
ros2 run rosbridge_server rosbridge_websocket || echo "Ocorreu um erro no rosbridge_server" &
ros2 run web_video_server web_video_server || echo "Ocorreu um erro no processo do web_video_server" &
ros2 run rosapi rosapi_node || echo "Ocorreu um erro rosapi_node" &

echo "Inicializando o Backend da Aplicação..."
cd /root/noblerobotics_hmi/backend && uvicorn main:app --host 0.0.0.0 --port 8000 || echo "Falha grave no Backend" &

echo "Inicializando o Frontend"
cd /root/noblerobotics_hmi/frontend && npm run dev || echo "Falha grave no Frontend" &

exec "$@"