FROM node:18
# Forcer le faite d'utiliser les miroirs français quand on utilise apt ...
COPY ./config/sources.list /etc/apt/sources.list
RUN \ 
  apt update && \
  apt install --assume-yes mycli && \
  npm install -g typescript && \
  npm install -g ts-node
WORKDIR /server