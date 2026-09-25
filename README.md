# NOBLEGIPAR IHM

Documento tutorial de instalação e utilização da Interface Humano Máquina do repositório "noblegipar-ihm", criada inicialmente para a cadeira de rodas autônoma NARA, sendo posteriormente expandida para a utilização com diferentes projetos e robôs que utilizam o ROS2.

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
sudo apt install ros-jazzy-rosbridge-suite && \
    sudo apt install ros-jazzy-web-video-server && \
    sudo apt install npm && \
    sudo apt install uvicorn && \
    sudo apt install pip && \
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
git clone https://github.com/GIPAR/noblegipar-ihm
```

### 2.1 - Backend

Para o pleno funcionamento do Backend, é necessário criar um arquivo .env com as credenciais do MongoDB — Essas credenciais não são dispostas ao público, entre em contato com a adminstração do repositório para requerê-lo —

```bash
# Caso o arquivo foi copiado no home do computador, do contrário, troque a pasta de destino a seguir
cd noblegipar-ihm/backend && \
    echo "MONGO_DB=coloque_as_credenciais_aqui" > credenciais.env
```

### 2.2 - Frontend

Para o funcionamento da Frontend, é necessário instalar os pacotes a partir dos seguintes comandos:

```bash
cd ~/noblegipar-ihm/frontend && \
    npm install
```

### 2.3 - Hosting (Opcional)

Celulares e tablets que se conectarem externamente normalmente terão o uso do microfone e das câmeras bloqueadas, impossibilitando o uso de algumas funcionalidades importantes para aumentar a acessibilidade do sistema. Portanto, é necessário tornar a conexão do website segura externamente

Primeiramente, é vital hostear o próprio wifi, enquanto simultaneamente conecta-se com uma rede externa. Para isso, [siga este arquivo com o passo-a-passo detalhado](/docs/ap-manager/ap-manager.md). Isso permite algumas configurações necessárias para o processo de certificação

Por fim, também é necessário tornar a conexão segura por meio da certificação do website. Esse processo é alcançado de uma forma simples, como explicado [neste segundo tutorial](/docs/Tutoriais/certificate.md)

## Inicializando o Website

### Inicializando o backend e a frontend

Há duas etapas para iniciar a interface, primeiramente é necessário rodar o backend em um terminal:

```bash
cd ~/noblegipar-ihm/backend && \
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Com a backend inicializada, rode o frontend em outro terminal

```bash
cd ~/noblegipar-ihm/frontend && \
    npm run dev
```

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

## 3 - Assistente Inteligente (Gemini)

A IHM possui integração com o modelo Gemini para consultas em linguagem natural.

### Configuração

Crie um arquivo `.env` na pasta raiz do projeto:

```env
VITE_GEMINI_API_KEY=sua_chave_gemini_aqui
```

A chave pode ser obtida através do Google AI Studio.

### Navegadores

| Navegador     | Suporte  |
| ------------- | -------- |
| Google Chrome | Completo |
| Firefox       | Parcial  |

No Firefox, as funcionalidades baseadas em reconhecimento de voz podem não estar disponíveis devido às limitações da Web Speech API.

## 4 - Regras de Projeto

Para a plena organização e desenvolvimento do projeto, todos os Commits de *novas* contribuições devem ser feitas fora do branch principal:

* Cria uma nova branch do repositório com o nome do seu enfoque no projeto
* Ou faça commit no repositório chamado "Desenvolvimento"
