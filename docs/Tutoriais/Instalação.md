# Tutorial de Instalação Manual

Documento tutorial de instalação e utilização da Interface Humano Máquina do repositório "noblerobotics_hmi", criada inicialmente para a cadeira de rodas autônoma NARA, sendo posteriormente expandida para a utilização com diferentes projetos e robôs que utilizam o ROS2.

* **Importante!** Leia com atenção durante a instalação
* O arquivo [Tutorial.md](/docs/Tutoriais/Tutorial.md) apresenta as explicações, descrições e tutoriais aprofundadas de algumas funcionalidades da interface
* O projeto pode ser instalado via docker, seguindo este [tutorial](/docs/Docker/docker.md)

## 1 - Pré-requisitos

É necessário instalar bibliotecas e diferentes dependências para o correto funcionamento da interface, sendo este rodado e testado no seguinte sistema

* Ubuntu 24.04
* ROS2 Jazzy

A instalação do ROS2 é necessária para a devida comunicação com os robôs, portanto, instale o ROS2 Jazzy pelo seguinte tutorial oficial [clickando aqui](https://docs.ros.org/en/jazzy/Installation.html). Contudo, espera-se que a maioria das funcionalidades da interface funcione em qualquer versão do ROS2

### 1.1 - Instalando Dependências Iniciais

Instale as seguintes bibliotecas, sendo o rosbridge necessário para comunicação entre a Interface e o ROS2, enquanto que o web-video-server é próprio para transmissão das imagens

```bash
sudo apt install ros-jazzy-rosbridge-suite ros-jazzy-web-video-server && \
    sudo apt install uvicorn pip nginx && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

Em um novo terminal, rode o comando:

```bash
pip install --break-system-packages fastapi pymongo python-dotenv python-multipart "numpy<2" && \
nvm install 24.11.1 # Apenas funciona se estiver em um novo terminal!
```

## 2 - Instalação da Interface

Baixe o repositório por meio do git clone diretamente do terminal

```bash
cd ~/ && \
    git clone https://github.com/GIPAR/noblerobotics_hmi
```

### 2.1 - Backend - Reconhecimento Facial (Opcional)

A Backend em si não precisa de preparação prévia para o método de login padrão. Quando utiliza-se o reconhecimento facial a história muda — para utilizá-la é necessário de uma "senha de acesso" específica do website MongoDB. Ela pode ser adquirida ***entrando em contato*** com os administradores desse repositório.

> Para logar pelo método comum isso não é necessário! Apenas quando é desejável utilizar o reconhecimento facial. Nota-se que o seu rosto também deve estar cadastrado na nuvem

Com a senha de acesso (credenciais) adquiridas, mova-se para a pasta do backend e rode o segundo comando modificando a linha "coloque_as_credenciais_aqui" pela senha. Ela salva as credenciais no projeto para que o Backend possa interpretá-la.

```bash
# Verifique se o caminho está correto 
cd ~/noblerobotics_hmi/backend && \
    # Substitua "coloque_as_credenciais_aqui" pela senha de acesso
    echo "MONGO_DB=coloque_as_credenciais_aqui" > credenciais.env
```

### 2.2 - Frontend

Para o funcionamento da Frontend, por sua vez, é necessário instalar os pacotes por meio do npm. Movimente-se para a pasta do frontend e rode o seguinte comando

```bash
# Verifique se o caminho para o frontend está correto 
cd ~/noblerobotics_hmi/frontend && \
    npm install
```

### 2.3 - Configurando o Website

O website consta com um intermediário de conexões do cliente denominado nginx, ele é utilizado para integrar tanto o uso via rede e o uso local com configurações avançadas. A utilização do nginx não é opcional, mas apenas é necessário esse único comando para seu funciomento

```bash
sudo printf "server {\n    listen 80;\n    listen 127.0.0.1;\n    server_name localhost 127.0.0.1;\n\n    location / {\n        proxy_pass http://127.0.0.1:5173;\n    }\n    \n    location /api/ {\n        proxy_pass http://127.0.0.1:8000;\n    }\n    \n    location /rosbridge {\n        proxy_pass http://127.0.0.1:9090/;\n        proxy_read_timeout 1h;\n        proxy_send_timeout 1h;\n    }\n}" | sudo tee /etc/nginx/sites-available/default && \
    sudo systemctl reload nginx
```

O comando anterior configura as conexões do website tanto localmente quanto via rede, especificamente para conexões http

#### Hosting e Certificação (Recomendado)

Recomenda-se fazer um passo-a-passo para hostear o próprio wifi e certificar o website. O tutorial específico para hosteamento pode ser acessado por meio [desse arquivo com o passo-a-passo detalhado](/docs/ap-manager/ap-manager.md)

#### Certificação

A certificação permite o uso de microfone e outros dispositivos por meio de uma conexão segura (https), sendo recomendado principalmente quando a interface é utilizada via rede. Primeiramente baixe os pacotes necessários e prepare as configurações iniciais

> O processo de certificação utiliza de um endereço público na internet. Contudo, para concluir a certificação é necessário possuir a senha de acesso desse domínio, a qual pode ser adquirida ***contatando os administradores do repositório***

``` bash
sudo apt install python3-pip python3-venv -y && \
sudo python3 -m venv /opt/certbot/ && \
sudo /opt/certbot/bin/pip install certbot certbot-dns-duckdns && \
sudo ln -s /opt/certbot/bin/certbot /usr/bin/certbot
```

Agora, vamos criar o arquivo de certificação com o certbot instalado. Nota-se que é necessário ter a senha de acesso do website DuckDNS, a qual necessita ser obtida ***contatando os administradores do repositório***

> Com a senha (token) obtida, rode o seguinte comando substituindo a linha "DuckDNS_Token" pela senha de acesso

``` bash
certbot certonly \
--config-dir ~/certs/config \
  --work-dir ~/certs/work \
  --logs-dir ~/certs/logs \
  --non-interactive --agree-tos --email noblegipar@gmail.com \
  --preferred-challenges dns \
  --authenticator dns-duckdns \
  --dns-duckdns-token DuckDNS_Token \
  --dns-duckdns-propagation-seconds 30 \
  -d noblegipar.duckdns.org
  # Caso não tenha o token, contate os administradores do repositório
```

Agora criaremos mais um arquivo de configuração da nginx para lidar com as conexões utilizando o certificado

``` bash
sudo printf "server {\n    listen 443 ssl;\n    listen [::]:443 ssl;\n    server_name noblegipar.duckdns.org;\n    \n    ssl_certificate     $HOME/certs/config/live/noblegipar.duckdns.org/fullchain.pem;\n    ssl_certificate_key $HOME/certs/config/live/noblegipar.duckdns.org/privkey.pem;\n    \n    client_max_body_size 20M;\n    \n    proxy_http_version 1.1;\n    proxy_set_header Upgrade \$http_upgrade;\n    proxy_set_header Connection 'upgrade';\n    proxy_set_header Host \$host;\n    proxy_cache_bypass \$http_upgrade;\n\n    location / {\n        proxy_pass http://127.0.0.1:5173;\n    }\n    \n    location /api/ {\n        proxy_pass http://127.0.0.1:8000;\n    }\n    \n    location /rosbridge {\n        proxy_pass http://127.0.0.1:9090/;\n        proxy_read_timeout 1h;\n        proxy_send_timeout 1h;\n    }\n}\n" | sudo tee /etc/nginx/sites-available/default-https && \
    sudo ln -s /etc/nginx/sites-available/default-https /etc/nginx/sites-enabled/ && \
    sudo systemctl reload nginx
```

Podemos automatizar o processo da renovação da certificação pelo sistema utilizando um serviço e um timer

``` bash
sudo printf "[Unit]\nDescription=Renova o Certificado - Chamado pelo Timer\n\n[Service]\nType=oneshot\nUser=$(whoami)\nExecStart=/usr/bin/certbot renew --config-dir $HOME/certs/config --work-dir $HOME/certs/work --logs-dir $HOME/certs/logs" | sudo tee /etc/systemd/system/certbot-renew.service && \
sudo printf "[Unit]\nDescription=Timer para Renovar o Certificado do Website\n\n[Timer]\nOnCalendar=daily\nPersistent=true\n\n[Install]\n\nWantedBy=timers.target" | sudo tee /etc/systemd/system/certbot-renew.timer && \
sudo systemctl daemon-reload && \
sudo systemctl enable --now certbot-renew.timer
```

## Inicializando o Website

### Inicializando o backend e a frontend

Com a preparação completa, precisa-se de apenas duas etapas para rodar a interface. Inicalize primeiramente o backend

```bash
cd ~/noblerobotics_hmi/backend && \
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

A partir da inicialização do backend, rode o frontend em outro terminal

```bash
cd ~/noblerobotics_hmi/frontend && \
    npm run dev
```

* O website pode ser acessado pelos ips que aparecem no terminal do frontend, sendo o "localhost" especificamente para conexão local e o restante via rede
* Alternativamente, caso o tutorial de certificação tenha sido completo, o website pode ser acessado pelo endereço "noblegipar.duckdns.org"

### Comunicação com o ROS2

Um Website não possui comunicação com o ROS2 nativamente, necessitando iniciar alguns pacotes para a devida troca de informações entre a interface e o robô

```bash
ros2 run rosbridge_server rosbridge_websocket
ros2 run web_video_server web_video_server # Em outro terminal
ros2 run rosapi rosapi_node # Em outro terminal
```

Caso o repositório da [noblenara](https://github.com/GIPAR/noblenara) estiver instalada, pode-se rodar este único comando:

``` bash
ros2 launch smartwheelchair bridgelaunch.xml
```
