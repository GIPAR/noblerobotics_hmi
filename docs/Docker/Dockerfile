FROM ros:jazzy-ros-base

SHELL ["/bin/bash", "-c"]
ENV DEBIAN_FRONTEND=noninteractive
ARG Set_DuckDNS_Token
ENV DuckDNS_Token=${Set_DuckDNS_Token}


# ================================================================
#  FASE 00 — Dependências Iniciais

# Frontend + Backend
RUN apt-get update && apt-get upgrade -y && \
    apt install -y ros-jazzy-rosbridge-suite ros-jazzy-web-video-server \ 
        uvicorn pip nginx && \
    pip install --break-system-packages fastapi pymongo python-dotenv python-multipart "numpy<2" && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Certbot
RUN apt-get update && \
    apt install -y python3-venv && \
    python3 -m venv /opt/certbot/ && \
    /opt/certbot/bin/pip install certbot certbot-dns-duckdns && \
    ln -s /opt/certbot/bin/certbot /usr/bin/certbot && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*


# ================================================================
#  FASE 01 — Instalação do Workspace
# RUN git clone https://github.com/GIPAR/noblerobotics_hmi && \
#     apt-get clean && \
#     rm -rf /var/lib/apt/lists/*

COPY ./noblerobotics_hmi /root/noblerobotics_hmi

WORKDIR /root/noblerobotics_hmi

RUN cd frontend && \
    npm install && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*


# ================================================================
#  FASE 02 — Preparações Finais
RUN if [ -z "$DuckDNS_Token" ]; then \
        echo "Aviso: Token do DuckDNS não recebido!"; \
    else \
        certbot certonly \
            --config-dir /root/certs/config \
            --work-dir /root/certs/work \
            --logs-dir /root/certs/logs \
            --non-interactive --agree-tos --email noblegipar@gmail.com \
            --preferred-challenges dns \
            --authenticator dns-duckdns \
            --dns-duckdns-token "$DuckDNS_Token" \
            --dns-duckdns-propagation-seconds 30 \
            -d noblegipar.duckdns.org; \
    fi

RUN printf "server {\n    listen 443 ssl;\n    listen [::]:443 ssl;\n    server_name noblegipar.duckdns.org;\n    \n    ssl_certificate     /root/certs/config/live/noblegipar.duckdns.org/fullchain.pem;\n    ssl_certificate_key /root/certs/config/live/noblegipar.duckdns.org/privkey.pem;\n    \n    client_max_body_size 20M;\n    \n    proxy_http_version 1.1;\n    proxy_set_header Upgrade \$http_upgrade;\n    proxy_set_header Connection 'upgrade';\n    proxy_set_header Host \$host;\n    proxy_cache_bypass \$http_upgrade;\n\n    location / {\n        proxy_pass http://127.0.0.1:5173;\n    }\n    \n    location /api/ {\n        proxy_pass http://127.0.0.1:8000;\n    }\n    \n    location /rosbridge {\n        proxy_pass http://127.0.0.1:9090/;\n        proxy_read_timeout 1h;\n        proxy_send_timeout 1h;\n    }\n}\n" | tee /etc/nginx/sites-available/default-https && \
    ln -s /etc/nginx/sites-available/default-https /etc/nginx/sites-enabled/ && \
    nginx -s reload

# ================================================================
#  FASE 03 — Ambiente e Entrypoint
# .bashrc → garante o ambiente em sessões interativas
RUN echo 'source /opt/ros/jazzy/setup.bash' >> /root/.bashrc
RUN echo 'export ROS_DOMAIN_ID=77' >> /root/.bashrc

# entrypoint → garante o ambiente em qualquer situação
COPY entrypoint.sh /main_entrypoint.sh
RUN chmod +x /main_entrypoint.sh

ENTRYPOINT ["/main_entrypoint.sh"]
CMD ["/bin/bash"]