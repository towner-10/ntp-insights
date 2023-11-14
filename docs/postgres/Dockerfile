FROM postgres:15

COPY ./api.ntpinsights.ca.cer /var/lib/postgresql/server.crt
COPY ./api.ntpinsights.ca.key /var/lib/postgresql/server.key

RUN chown postgres /var/lib/postgresql/server.crt
RUN chown postgres /var/lib/postgresql/server.key

RUN chmod 600 /var/lib/postgresql/server.crt
RUN chmod 600 /var/lib/postgresql/server.key

EXPOSE 5432

ENTRYPOINT [ "docker-entrypoint.sh" ]

CMD [ "-p", "5432", "-c", "ssl=on", "-c", "ssl_cert_file=/var/lib/postgresql/server.crt", "-c", "ssl_key_file=/var/lib/postgresql/server.key" ]
