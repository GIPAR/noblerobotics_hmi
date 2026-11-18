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
WORKDIR /root/

RUN git clone https://github.com/GIPAR/noblerobotics_hmi && \
     apt-get clean && \
     rm -rf /var/lib/apt/lists/*

WORKDIR /root/noblerobotics_hmi

RUN cd frontend && \
    npm install && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*


# ================================================================
#  FASE 02 — Preparações Finais
COPY /default-https.conf  /tmp/default-https.conf
COPY /default.conf  /tmp/default.conf

RUN if [ -z "$DuckDNS_Token" ]; then \
        echo "Aviso: Token do DuckDNS não recebido!" && \
        cp /tmp/default.conf /etc/nginx/sites-available/default; \
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
            -d noblegipar.duckdns.org && \
        cp /tmp/default-https.conf  /etc/nginx/sites-available/default; \
    fi && \
    rm -f /tmp/default.conf /tmp/default-https.conf

# ================================================================
#  FASE 03 — Ambiente e Entrypoint
# .bashrc → garante o ambiente em sessões interativas
COPY fastdds_profile.xml /root/noblerobotics_hmi/

RUN echo 'source /opt/ros/jazzy/setup.bash' >> /root/.bashrc && \
    echo 'export FASTRTPS_DEFAULT_PROFILES_FILE=/root/noblerobotics_hmi/fastdds_profile.xml' >> /root/.bashrc && \
    echo 'export ROS_DOMAIN_ID=77' >> /root/.bashrc

# entrypoint → garante o ambiente em qualquer situação
COPY entrypoint.sh /main_entrypoint.sh
RUN chmod +x /main_entrypoint.sh

ENTRYPOINT ["/main_entrypoint.sh"]
CMD ["/bin/bash"]