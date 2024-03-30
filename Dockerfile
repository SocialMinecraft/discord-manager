FROM node:20

#ENV DISCORD_TOKEN todo
#ENV DISCORD_CLIENT_ID todo
#ENV DISCORD_GUILD_ID todo
#ENV NATS_URL todo

RUN mkdir /code
COPY . /code/

WORKDIR /code
RUN npm install
RUN npm run build

RUN mv dist /app
RUN mv proto /app/proto
RUN mv node_modules /app/node_modules
RUN rm -rf /code

WORKDIR /app
CMD ["node", "index.js"]

#docker build --platform linux/amd64 --no-cache -t dmgarvis/discord-manager:latest .
#docker push dmgarvis/discord-manager:latest

#docker run --env-file .env dmgarvis/discord-manager:latest