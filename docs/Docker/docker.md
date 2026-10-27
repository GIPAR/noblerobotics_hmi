# Docker.md

O Docker é uma plataforma de código aberto que permite que nós isolemos as dependências e os códigos principais de uma aplicação. Em outras palavras, criamos uma maneira de incluir todas as dependências para o funcionamento de um projeto em um ambiente que podemos replicar e utilizar facilmente

## Pré-requisitos

É necessário seguir alguns passos para permitir que rodemos a interface em um container

### ap-manager

Assim como na instalação manual, também é necessário preparar o host da interface para hostear o próprio wifi, enquanto simultaneamente conecta-se com uma rede externa. Para isso, [siga este mesmo arquivo com o passo-a-passo detalhado](/docs/ap-manager/ap-manager.md). Isso permite algumas configurações necessárias para o processo de certificação

## Instalando a Imagem

```bash
cd ~/noblerobotics_hmi/docs/Docker/ && \
    docker build -t noblerobotics_hmi --build-arg Set_DuckDNS_Token="" .
```

a

```bash
docker run -it --privileged --network=host --ipc=host --name=noblerobotics_container --pid=host --restart=unless-stopped -v /dev:/dev noblerobotics_hmi
```
