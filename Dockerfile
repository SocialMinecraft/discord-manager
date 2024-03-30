FROM node:20

#ENV DISCORD_TOKEN todo
#ENV DISCORD_CLIENT_ID todo
#ENV DISCORD_GUILD_ID todo
#ENV NATS_URL todo

RUN mkdir /code
COPY . /code/

RUN mkdir /proto
COPY ../proto/* /proto/

WORKDIR /code
RUN npm install
RUN npm run build

RUN mv dist /app
RUN rm -rf /code

WORKDIR /app
CMD ["node", "index.js"]

#docker build --no-cache -t dmgarvis/discord-manager:latest .
#docker push dmgarvis/discord-manager:latest