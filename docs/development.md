# IHM Server Development

## Development Notes

### Development

* Front end agora lê o arquivo de certificação encontrado no /home/user/certs (precisa ser adicionado!)
Changes: vite.config.ts

Pra fazer build

docker build -t noblegipar_dev --build-arg Set_DuckDNS_Token="" .

docker run -it --privileged --network=host --ipc=host --name=noblegipar-ihm --pid=host --restart=unless-stopped -v /dev:/dev noblegipar-ihm

OBS: Testar se o entrypoint está funcionando para renovar o certificado

## Planos Atuais

* Adição de Funcionalidades:
    Adicionar setting de MaxSpeed no Configuration.tsx

* Mudanças Gerais:
    Talvez fazer o mapa SLAM ficar no meio da tela
    Adicionar forma de colocar câmeras ou mapas adicionais na tela

* Adições Gerais:
    Desenvolver Posteriormente o tutorial em uma versão mais atualizada da IHM

* Agente de IA
    Verificar realmente as opções que temos para servir os agentes além de vLLM e Ollama

## Notas

* Futuramente verificar trocar webvideoserver por:
H.264/H.265 via FFMPEG (ffmpeg_image_transport)
    What it is: Video compression using keyframes with predictive frames encoding only differences between frames; Bandwidth: ~1-5 Mbps typical (configurable via bitrate)
    Use case: Best for teleoperation - high frame rate video over WiFi
        'You need the <video tag: It activates the browser's built-in video player engine (hardware acceleration).'

* Certificação do website para não ser um link inseguro quando conectado na rede local
Importante para o funcionamento dos dispositivos!
Domínio Robusto para Aplicação: DigitalPlat + Cloudflare

## Details (ignore)

node --version 24.11.1
nvm --version 0.39.2
npm --version 11.6.2
