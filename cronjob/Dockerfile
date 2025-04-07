FROM node:18

WORKDIR /app

COPY notificarVencimientos.js .
COPY crontab.txt /etc/cron.d/tarea
RUN chmod 0644 /etc/cron.d/tarea && crontab /etc/cron.d/tarea

CMD ["cron", "-f"]
