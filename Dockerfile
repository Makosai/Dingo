# Node 10 for Firebase
FROM node:10

# Setup project directory.
WORKDIR /app

# Copy required files.
COPY package.json .
COPY nodemon.json .
COPY tsconfig.json .
COPY tslint.json .
# src/firebase/firebase.config.json required.
COPY ./src ./src
COPY ./react ./react

# Install packages and build
RUN yarn install

WORKDIR /app/react

RUN yarn install; yarn build
RUN yarn build

EXPOSE 2241
EXPOSE 2351
CMD ["yarn", "start"]