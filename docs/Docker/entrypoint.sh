#!/bin/bash
set -e
export ROS_DOMAIN_ID=77
certbot renew --config-dir $HOME/certs/config --work-dir $HOME/certs/work --logs-dir $HOME/certs/logs
exec "$@"