# Docker.md

O presente documento apresenta o tutorial de instalação principal da interface, a qual utiliza a plataforma denominada Docker. O Docker é uma plataforma de código aberto que permite que nós isolemos as dependências e os códigos principais de uma aplicação em uma container. Em outras palavras, criamos uma maneira de incluir todas as dependências para o funcionamento de um projeto em um "caixa" que pode ser replicada e utilizada facilmente, simplificando o processo de instalação

* **Importante!** Leia com atenção o processo de instalação
* O presente tutorial é voltado para computadores rodando especificamente o Ubuntu como Sistema Operacional

## Pré-requisitos

É necessário instalar bibliotecas e diferentes dependências para o correto funcionamento da interface, iniciando-se pela própria plataforma Docker. Ela pode ser instalada em diversos tipos de sistemas operacionais, [acessando o site oficial por meio deste link](https://docs.docker.com/engine/install/)

### Ponto de Acesso

Semelhantemente á instalação manual, recomenda-se preparar o host da interface para hostear o próprio wifi, enquanto simultaneamente conecta-se com uma rede externa. Para isso, [siga este mesmo arquivo com o passo-a-passo detalhado](/docs/ap-manager/ap-manager.md). Isso permite algumas configurações necessárias para o processo de certificação

## Instalando o Container

Agora, para realmente rodarmos a interface, vamos utilizar o Docker para criar o container da nossa aplicação. Vamos primeireiramente criar uma imagem, baixando este repositório por meio do comando git clone

```bash
cd ~/ && \
    git clone https://github.com/GIPAR/noblerobotics_hmi
```

Posteriormente, criaremos a imagem do nosso container com o comando docker build. ***Nota-se que há uma configurações importantes nesse processo***. A imagem e o container podem ser construidos de modo que permita uma conexão segura em conexões https. O website utiliza um processo de certificação que conecta-se a um domínio público, mas que requer uma senha de acesso do provedor DuckDNS. O token de acesso pode ser adquirido contatando os administradores do repositório ou do grupo "GIPAR"

> Nota-se que esse processo de certificação não é obrigatório, mas que não permitirá o uso do microfone para comandos de voz ou de conversasão com o chatbot quando a interface é conectada via rede

Com a senha de acesso adquirida, modifique o comando seguinte incluindo o token na linha *Set_DuckDNS_Token="Coloque_seu_Token_Aqui"*. Caso queira rodar a interface sem o token, rode o comando sem modificações

```bash
cd ~/noblerobotics_hmi/docs/Docker/ && \
    docker build -t noblerobotics_hmi --build-arg Set_DuckDNS_Token="" .
```

Por fim, criaremos o próprio container por meio dessa imagem

```bash
docker run -it --privileged --network=host --ipc=host --name=noblerobotics_container --pid=host --restart=unless-stopped -v /dev:/dev noblerobotics_hmi
```

O comando acima cria um container que inicializa e reinicializa automaticamente, inclusive quando o sistema é desligado ou reiniciado

## Acessando a Interface

O container já é configurado para incializar toda a aplicação automaticamente, incluindo não apenas a frontend, mas também o backend e o rosbridge, sendo necessário apenas acessar por meio do navegador. Há duas formas de conexão, por meio do computador local ou por meio da rede wifi

### Conectando-se Localmente

Para conectar localmente, por meio da própria máquina que está rodando o container, basta acessar o navegador com esse link

```bash
http://localhost:5173/
```

### Conectando-se via Rede

A conexão via rede possui duas ramificações diferentes: Caso a imagem foi construida com a senha de acesso configurada, podemos conectar de forma segura com o seguinte url

```bash
https://noblegipar.duckdns.org/
```

Alternativamente, podemos verificar os possíveis ips de conexão por meio do seguinte comando no computador host

```bash
# Procure pelas linhas semelhantes a "Network: http://192.168.0.131:5173/"
docker logs noblerobotics_container
```
