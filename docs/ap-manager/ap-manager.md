# ap-manager

Arquivo passo-a-passo para tornar o computador um ponto de acesso, hosteando o próprio wifi

> Hostear o próprio wifi permite certificar o website, a qual possibilita o uso de microfone e outros dispositivos por meio de uma conexão segura (https), sendo recomendado principalmente quando a interface é utilizada via rede

## Ponto de Acesso de Wifi

O tutorial está configurado para rodar o Access Point em segundo plano, podendo utilizar a internet de outra rede simultaneamente

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
