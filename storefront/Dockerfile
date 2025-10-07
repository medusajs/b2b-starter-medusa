FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

EXPOSE 8000

CMD ["yarn", "dev"]