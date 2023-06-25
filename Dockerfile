FROM node:20.3 
# dprint does not have alpine builds atm
WORKDIR /app

RUN apt-get update
RUN apt-get install --yes nodejs npm supervisor
# Install pnpm for package management
RUN npm install -g pnpm pm2
# To cache node installs
COPY pnpm-lock.yaml package.json .
RUN pnpm install
# Build app
COPY ./ .
RUN pnpm build
ENV NODE_ENV production
CMD ["supervisord", "-n", "-c", "/app/deploy/supervisord.conf"]
