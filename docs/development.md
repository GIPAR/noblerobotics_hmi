# IHM Server Development

## Development Notes

### Development

1. Finalização da arquitetura funcional do Docker - Falta Revisar

Corrigir bugs!!!!

1. Conexão com as cameras está considerando como insegura, ver essa bomba dps

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

## Details (ignore)

node --version 24.11.1
nvm --version 0.39.2
npm --version 11.6.2
