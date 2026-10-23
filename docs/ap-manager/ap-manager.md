# ap-manager

Arquivo passo-a-passo para certificar o website e tornar o computador um ponto de acesso, hosteando o próprio wifi

> A certificação do website permite o uso de microfone e outros dispositivos por meio de uma conexão segura (https), sendo recomendado principalmente quando a interface é utilizada via rede

## Certificação

Vamos inicializar pela certificação, baixando os pacotes necessários e preparando as configurações iniciais

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

## Ponto de Acesso de Wifi

O último passo para permitir a conexão segura do website é hosteando o próprio wifi. O tutorial está configurado para rodar o Access Point em segundo plano, podendo utilizar a internet de outra rede simultaneamente

### Dependências Iniciais

Como de costume, primeiramente vamos baixar e instalar as dependências iniciais

``` bash
sudo apt install hostapd dnsmasq iw && \
sudo systemctl stop hostapd dnsmasq && \
sudo systemctl disable hostapd && \
sudo systemctl mask hostapd
```

Posteriormente, é necessário verificar se o driver de wifi suporta a configuração AP + Client, por meio dos seguintes comandos

``` bash
iw list | grep -A 15 "valid interface combinations" # Verifique se aparece conjuntamente "#{managed} ... {AP, ...}" em uma mesma linha, que implica o suporte da configuração simultanea de AP + Client
```

> Caso não tenha a combinação descrita, não há possibilidade de hostear o próprio wifi

### Encontrar o nome da Interface

Verificando que existe o suporte do driver, precisamos saber qual o nome da interface do dispositivo de rede do seu computador. Simplesmente rode o seguinte comando

``` bash
iw dev # Veja á direita da palavra "Interface" como por exemplo: Interface wlp4s0
```

Vamos rodar um pequeno script para atualizar os nossos códigos com o nome da interface: substitua "wlp4s0" pelo nome verificado anteriormente

``` bash
NOME_DA_INTERFACE="wlp4s0" && \
sed -i "s/^INTERFACE_NAME=\".*\"/INTERFACE_NAME=\"$NOME_DA_INTERFACE\"/" \
  ~/noblerobotics_hmi/docs/ap-manager/90-ap-sync \
  ~/noblerobotics_hmi/docs/ap-manager/ap-manager.sh
```

### Preparando o ap-manager

Para a utilização automática do ap-manager, precisamos mover os códigos para a pasta de execução automática do sistema. Os seguintes comandos fazem esse papel descrito, com a adição de dar permissão de execução para que eles possam ser executados

``` bash
sudo cp ~/noblerobotics_hmi/docs/ap-manager/ap-manager.service /etc/systemd/system/ap-manager.service && \
sudo cp ~/noblerobotics_hmi/docs/ap-manager/ap-manager.sh /usr/bin/ap-manager.sh && \
sudo cp ~/noblerobotics_hmi/docs/ap-manager/90-ap-sync /etc/NetworkManager/dispatcher.d/90-ap-sync && \
    sudo chmod +x /usr/bin/ap-manager.sh && \
    sudo chmod +x /etc/NetworkManager/dispatcher.d/90-ap-sync
```

Por último, devemos habilitar a inicialização automática do serviço no iniciar

``` bash
sudo systemctl enable ap-manager.service # Caso queira iniciar sem reiniciar o computador, faça o comando "sudo systemctl start ap-manager.service"
```
