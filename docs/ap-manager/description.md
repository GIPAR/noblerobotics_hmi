# Descrição

Esta seção apresentará de forma breve o funcionamento e a arquitetura do ap-manager

Existem três arquivos centrais de funcionamento, o serviço, o script e o atualizador

## Serviço

O ap-manager.service é o arquivo principal de serviço do sistema. Sua função principal consiste em rodar o script quando inicializado e o de remover as principais modificações realizadas na saída

## Script

O script ap-manager.sh é o maior componente com o maior número de funções. Ele segue o seguinte passo-a-passo:

1. Verifica a frequência e o DNS principal da rede conectada (a maioria dos dispositivos precisam que o AP tenha o mesmo canal que o Cliente)
2. Cria uma interface secundária para o AP, retirando também o seu gerenciamento do NetworkManagaer (que é feito pelo hostapd)
3. Configura o AP a partir da frequência e do DNS analisado anteriormente
4. Configura o dnsmasq (lida com os IPs e com o DNS), incluindo o DNS principal resolvido na primeira etapa
5. Configurações finais para permitir que o AP utilize a internet da interface principal
6. Inicializa o hostapd com o arquivo de configurações criado anteriormente

## Atualizador

Por fim, este último arquivo 90-ap-sync permite que o ap-manager funcione completamente quando a rede da interface principal mude. Seu papel é o de parar o serviço do ap-manager temporariamente, necessário para a reconfiguração do sistema com uma nova rede conectada
