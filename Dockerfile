FROM node:24-alpine

WORKDIR /app

COPY package.json .

RUN npm install

RUN npm i -g serve

COPY . .

# Accept build arguments
ARG VITE_API_BASE_URL
ARG VITE_WS_BASE_URL
ARG VITE_THIRDWEB_CLIENT_ID

# Set as environment variables for the build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_WS_BASE_URL=${VITE_WS_BASE_URL}
ENV VITE_THIRDWEB_CLIENT_ID=${VITE_THIRDWEB_CLIENT_ID}

RUN npm run build

EXPOSE 3000

CMD [ "serve", "-s", "dist" ]