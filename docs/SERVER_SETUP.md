# Server Setup for Docker

## Requirements

- Docker
- Docker Compose
- Git
- acme.sh (optional)
- ufw (optional)
- ufw-docker (optional)

## Setup

1. Create directory for the project (`mkdir ntp`)
2. Install docker and docker-compose
3. Install git
4. Create `nginx` directory with `nginx.conf` file. Example file can be found in `docs/nginx/nginx.conf` (removed a few lines for security reasons)
5. Create `postgres` directory with `Dockerfile` file. Example file can be found in `docs/postgres/Dockerfile`. Change the port to whatever you want. (in the example I used 5432)
6. In `/ntp` directory, create `docker-compose.yml` file. Example file can be found in `docs/docker-compose.yml`. Many values are hidden/removed for security reasons. You must go through and figure out what values need to be filled in before running the docker-compose file.
7. Setup [acme.sh](https://github.com/acmesh-official/acme.sh) to create SSL certificates.
8. Setup [ufw](https://help.ubuntu.com/community/UFW) and [docker-ufw](https://github.com/chaifeng/ufw-docker) to allow docker containers to access ports on the host machine.
9. Run `docker-compose up -d` to start the containers. The backend will continue to fail since the database has not been setup yet.
10. On your local machine, use Prisma to setup the database.
11. Once the database is setup, the backend should be able to connect to the database and start up. Run `docker-compose down` and then `docker-compose up -d` to restart the containers.
12. Use `ufw-docker` to setup the firewall to allow the database and proxy to access the ports on the host machine. Example commands can be found in `docs/SERVER_HTTPS_UPDATE` for the commands used to reset the UFW options.
