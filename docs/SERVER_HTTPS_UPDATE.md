# Updating the SSL Certificate

On the api.ntpinsights.ca domain we chose to use acme.sh for its easy to use ACME client CLI. This allows us to easily renew our SSL certificate every 90 days. The following steps are how to renew the SSL certificate.

1. Connect to server
2. Stop docker & remove containers (`docker compose down`)
3. Delete images (`docker image rm ntp-backend; docker image rm ntp-db`)
4. Run acme.sh (`acme.sh --renew -d api.ntpinsights.ca --force`)
5. Once complete, create the docker container again (`docker compose up -d`)
6. Update the firewall since docker will create new networks (`sudo ufw-docker allow database <port>/tcp; sudo ufw-docker allow proxy 443/tcp`)
7. Check ntpinsights.ca to see if database and websocket (Connection badge) are working
