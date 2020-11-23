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
RUN yarn build

EXPOSE 2241
CMD ["yarn", "start"]