# Certificando o Website

Caso queira rodar a interface fora de um container, é necessário certificá-lo manualmente de acordo com os apssos a seguir. Vale ressaltar que esse processo é importante para permitir que dispostivos externos utilizem a câmera e o microfone. Isso é possível apenas quando o website é certificado. Para isso, primeiramente baixe os pacotes necessários e prepare as configurações iniciais

``` bash
sudo apt install python3-pip python3-venv -y && \
sudo python3 -m venv /opt/certbot/ && \
sudo /opt/certbot/bin/pip install certbot certbot-dns-duckdns && \
sudo ln -s /opt/certbot/bin/certbot /usr/bin/certbot
```

Agora vamos criar o arquivo de certificação com o certbot instalado, para isso, rode o seguinte comando substituindo a linha "DUCKDNS_TOKEN" pelo token da conta DuckDNS

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

Vamos automatizar o processo de certificação no sistema por meio de um serviço e um timer

``` bash
sudo printf "[Unit]\nDescription=Renova o Certificado - Chamado pelo Timer\n\n[Service]\nType=oneshot\nUser=$(whoami)\nExecStart=/usr/bin/certbot renew --config-dir $HOME/certs/config --work-dir $HOME/certs/work --logs-dir $HOME/certs/logs" | sudo tee /etc/systemd/system/certbot-renew.service && \
sudo printf "[Unit]\nDescription=Timer para Renovar o Certificado do Website\n\n[Timer]\nOnCalendar=daily\nPersistent=true\n\n[Install]\n\nWantedBy=timers.target" | sudo tee /etc/systemd/system/certbot-renew.timer
```

Por fim, ativaremos os arquivos recentemente criados

``` bash
sudo systemctl daemon-reload && \
sudo systemctl enable --now certbot-renew.timer
```
