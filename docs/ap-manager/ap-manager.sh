#!/bin/bash

INTERFACE_NAME=wlp4s0
CHANNEL=1
FREQUENCY=2412
DNS_SERVER=192.168.0.1



# ------ Configurações Iniciais --------------

FREQUENCY=$(iw dev ${INTERFACE_NAME} link | grep -oP 'freq: \K[0-9]+')

if [ -z "$FREQUENCY" ]; then
    CHANNEL=1
elif [ "$FREQUENCY" -ge 2412 ] && [ "$FREQUENCY" -le 2484 ]; then
    CHANNEL=$(( (FREQUENCY - 2407) / 5 ))
elif [ "$FREQUENCY" -ge 5000 ]; then
    CHANNEL=$(( (FREQUENCY - 5000) / 5 ))
else
    CHANNEL=1
fi

DNS_SERVER=$(resolvectl dns ${INTERFACE_NAME} 2>/dev/null | awk '{print $NF}')

if [ -z "$DNS_SERVER" ]; then
    DNS_SERVER=8.8.8.8
fi



# ------ Configurações dos Dispostivos -------

iw dev ap0 del 2>/dev/null || true

printf "[keyfile]\nunmanaged-devices=interface-name:ap0\n" | tee /etc/NetworkManager/conf.d/unmanaged.conf

systemctl reload NetworkManager

sleep 2



# ------ Configurações do AccessPoint --------

iw dev ${INTERFACE_NAME} interface add ap0 type __ap

ip addr add 192.168.4.1/24 dev ap0

# ip link set dev ap0 up

printf "interface=ap0\ndriver=nl80211\nssid=noblegipar\ncountry_code=BR\n\nhw_mode=g\nchannel=${CHANNEL}\n\nwpa=2\nwpa_key_mgmt=WPA-PSK SAE\nieee80211w=1\nsae_password=usergipar\nwpa_passphrase=usergipar\nrsn_pairwise=CCMP\n\nieee80211n=1\nwmm_enabled=1\n\nmacaddr_acl=0\nmax_num_sta=5\nap_isolate=1\n" | tee /etc/hostapd/hostapd.conf



# ------ Configuração dnsmasq -----------------

printf "interface=ap0\nbind-interfaces\nexcept-interface=lo\n\ndhcp-range=192.168.4.100,192.168.4.110,255.255.255.0,12h\ndhcp-option=3,192.168.4.1\ndhcp-option=6,192.168.4.1\n\nserver=${DNS_SERVER}\nserver=1.1.1.1\n\naddress=/noblegipar.duckdns.org/192.168.4.1" | tee /etc/dnsmasq.conf

systemctl restart dnsmasq



# ------ Configuração Finais -----------------

sysctl -w net.ipv4.ip_forward=1

iptables -t nat -A POSTROUTING -o ${INTERFACE_NAME} -j MASQUERADE

iptables -I FORWARD 1 -i ap0 -o ${INTERFACE_NAME} -j ACCEPT

iptables -I FORWARD 2 -i ${INTERFACE_NAME} -o ap0 -m state --state RELATED,ESTABLISHED -j ACCEPT



# ----------- Inicialização hostap ------------

exec hostapd /etc/hostapd/hostapd.conf