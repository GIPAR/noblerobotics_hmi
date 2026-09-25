# Tutorial - 20/06/2026

Documento que organiza e ajunta as explicações das diferentes funcionalidades da IHM

## Funcionamento Geral

A interface é dividida, atualmente, em dois tipos de usuários, usuários comuns e desenvolvedores. Sendo que os desenvolvedores possuem um maior número de funções e ferramentas disponíveis, voltadas para o próprio desenvolvimento dos projetos. Contudo, até o momento, não foi adicionado um backend para lidar com diferentes tipos de login, sendo enxertado diretamente na frontend por meio de logins temporários

Um login com privilégios de desenvolvedor poderá escolher que tipo de ambiente está sendo utilizado, virtual ou físico, a qual mudará automaticamente quais tópicos estão sendo trabalhados, tanto para publicação quanto para inscrição. Neste caso, não apenas os nomes dos tópicos podem mudar de acordo com o ambiente, como também alguns podem existir apenas no físico ou apenas no simulado, como é o caso do tópico da visualização do nível de bateria

Até o momento, estas são as principais funções presentes na IHM:

1. Visualização das Câmeras
2. Controle de Movimentação Manual
3. Visualização do Nível da Bateria (Ambiente Físico)
4. Visualização do Mapa criado pelo SLAM (Desenvolvedor)
5. Visualização da Posição do Robô em relação ao Mapa (Desenvolvedor)
6. Publicar Comando de Navegação Autônoma (Desenvolvedor)
7. Alterar Robô Utilizado (Desenvolvedor)
8. Visualização dos Nós, Tópicos e Serviços (Desenvolvedor)
9. Controle por Voz

Essas funcionalidades serão explicadas posteriormente

## Principais Abas da IHM

A interface é divida em duas partes principais, sendo uma delas a introdução e a tela Principal. Na introdução é onde há o espaço de login. Neste caso, contas com privilégio de desenvolvedor podem escolher o tipo de usuário, caso queiram desenvolver com a visualização de usuários comuns, e qual ambiente está sendo utilizado. Por outro lado, usuários sem privilégios possuem uma tela de auxílio que fornece informações da conexão com o robô (rosbridge) e o estado da bateria (caso o ROS2 esteja conectado), podendo seguir para a tela principal após a conexão

---

Por outro lado, a imagem a seguir exemplifica os principais botões da tela principal

![Tutorial Main Page](/nara-ihm/src/assets/Geral/Tutorial%20-%20June%2004,%202026%20at%2012.21.16.png)

Na IHM podemos visualizar duas câmeras simultâneas, sendo que qual estará no container principal pode ser modificado por meio da dupla seta encontrada no dashboard lateral. Ademais, enquanto que no container principal há apenas um conteúdo, o dashboard lateral pode possuir vários conteúdos em sequência

## Controle por Voz

Módulo inicial de interação por voz, integrado ao ROS2 por meio do `rosbridge`.

### Funcionalidades específicas implementadas

* Reconhecimento de voz em português;
* Resposta por voz usando Text-to-Speech;
* Publicação de comandos no tópico `/noblenara/cmd_vel`;
* Consulta de status da bateria;
* Consulta de status da conexão com ROS2;
* Identificação do ambiente atual: cadeira real ou virtual;
* Consulta do último comando executado;
* Comando de ajuda com lista de comandos disponíveis;
* Comandos conversacionais básicos;
* Estrutura inicial para navegação futura;
* Separação da lógica em `VoiceCommandService` e `VoicePatterns`.

### Observação Importante

O reconhecimento de voz foi testado no Google Chrome. Navegadores como Firefox podem não oferecer suporte adequado à Web Speech API.

### Comandos de voz disponíveis

Controle da cadeira:

* frente; direita; esquerda; parar; para trás; voltar

Consultas:

* status da bateria; status da conexão; ambiente atual; último comando; comandos disponíveis; ajuda; que horas são; qual a data de hoje

Comandos conversacionais:

* quem é você; o que é a NARA; qual é seu objetivo; o que você pode fazer

### Teste de bateria em ambiente virtual

Caso a cadeira real esteja desligada, é possível simular a bateria com:

```bash
ros2 topic pub /noblenara/battery_status sensor_msgs/msg/BatteryState "{voltage: 24.6}"
```

Depois, na IHM, diga:

```text
status da bateria
```

## Assistente Inteligente

### Configuração Inicial

1. Obtenha uma chave Gemini no Google AI Studio.
2. Crie um arquivo `.env` na pasta `nara-ihm`.
3. Adicione:

```env
VITE_GEMINI_API_KEY=sua_chave_aqui
```

4. Reinicie a aplicação:

```bash
npm run dev
```

### Perguntas por Texto

Digite uma pergunta no campo "Assistente IA" e clique em "Perguntar".

Exemplos:

* Qual ambiente estou utilizando? ::: Qual é o status da conexão? ::: Qual é o status da bateria? ::: O que é ROS2?

### Perguntas por Voz

Clique em:

```text
🎤 Perguntar por voz
```

Faça a pergunta utilizando o microfone.

O sistema irá:

* Reconhecer a fala -> Consultar o Gemini -> Exibir a resposta -> Reproduzir a resposta por voz.

### Comandos em Linguagem Natural

O assistente é capaz de interpretar diferentes formas de expressar uma mesma intenção.

Exemplos:

Movimento para a Frente

* frente; pode avançar um pouco?; siga em frente; mova para frente

Movimento para trás

* voltar; retorne um pouco; mova para trás

Giro para direita

* direita; vire para a direita; gire para a direita

Giro para esquerda

* esquerda; vire para a esquerda; gire para a esquerda

Parada

* parar; pare agora; interrompa o movimento

### Memória Conversacional

O assistente mantém um histórico recente das interações realizadas.

Exemplo:

Usuário:
Quem foi Nikola Tesla?

Usuário:
Quando ele nasceu?

O assistente consegue utilizar o histórico para compreender que a segunda pergunta está relacionada à primeira.

### Limitações Conhecidas

#### Firefox

O Firefox pode não oferecer suporte ao reconhecimento de voz utilizado pela aplicação.

Nesse caso, apenas consultas por texto estarão disponíveis.

#### Chave não configurada

Caso apareça a mensagem:

```text
A chave da API Gemini não está configurada neste ambiente.
```

verifique se o arquivo `.env` foi criado corretamente e reinicie o servidor Vite.

## Navegação Autônoma e Mapeamento

Podemos visualizar o Mapa que está sendo Gerado, ativando-a pelo menu de configurações, especificamente na aba "Ferramentas -> Ferramentas do ROS2". Há um total de três funcionalidades adicionadas referente á esta opção

1. Visualização do Mapa SLAM em tempo real, que se encontrará no Dashboard Lateral
2. Visualização da posição do Robô em relação ao Mapa, representado por uma seta
3. Comandar o Robô por meio da Navegação Autônoma

Para mandar um comando, simplesmente clicke no destino desejado no mapa 2D
