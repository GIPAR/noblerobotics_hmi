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
        uvicorn pip && \
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
RUN git clone https://github.com/GIPAR/noblegipar-ihm && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /noblerobotics_hmi

RUN cd frontend/ && \
    npm install && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*


# ================================================================
#  FASE 02 — Preparações Finais
RUN if [ -z "$DuckDNS_Token" ]; then \
        echo "Aviso: Token do DuckDNS não recebido!"; \
    else \
        certbot certonly \
            --config-dir ~/certs/config \
            --work-dir ~/certs/work \
            --logs-dir ~/certs/logs \
            --non-interactive --agree-tos --email noblegipar@gmail.com \
            --preferred-challenges dns \
            --authenticator dns-duckdns \
            --dns-duckdns-token "$DuckDNS_Token" \
            --dns-duckdns-propagation-seconds 30 \
            -d noblegipar.duckdns.org; \
    fi


# ================================================================
#  FASE 03 — Ambiente e Entrypoint
# .bashrc → garante o ambiente em sessões interativas
RUN echo 'export ROS_DOMAIN_ID=77' >> /root/.bashrc

# entrypoint → garante o ambiente em qualquer situação
COPY entrypoint.sh /ros.entrypoint.sh
RUN chmod +x /ros_entrypoint.sh

ENTRYPOINT ["/ros_entrypoint.sh"]
CMD ["/bin/bash"]