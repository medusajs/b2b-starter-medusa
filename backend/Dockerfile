FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build the application
RUN yarn build

EXPOSE 9000

CMD ["yarn", "dev"]