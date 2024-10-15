<h1 align="center">
  <br>
  <a href="http://www.amitmerchant.com/electron-markdownify"><img src="https://github.com/user-attachments/assets/38ba3a7b-e07b-4117-8187-7b171eae3769" alt="B2B Commerce Starter" width="200"></a>
  <br>
  <br>
  B2B Commerce Starter
  <br>
</h1>

<h4 align="center">Customizable eCommerce monorepo built with <a href="https://medusajs.com/" target="_blank">Medusa 2.0</a> - Storefront & API</h4>

<p align="center">
  <a href="https://github.com/medusajs/medusa/blob/master/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
    
  <a href="https://discord.gg/xpCwq3Kfn8">
    <img src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" alt="Discord Chat" />
  </a>

  <a href="https://twitter.com/intent/follow?screen_name=medusajs">
    <img src="https://img.shields.io/twitter/follow/medusajs.svg?label=Follow%20@medusajs" alt="Follow @medusajs" />
  </a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="https://docs.medusajs.com/v2">Medusa Documentation</a> •
  <a href="https://medusajs.com/">Medusa Website</a>
</p>

<br>

<p align="center">
  <img src="https://github.com/user-attachments/assets/00ffe4c0-cba7-422d-8171-2f6bc301f854" alt="Follow @medusajs" />
</p>

<br>

<details>
  <summary><b>Table of Contents</b></summary>

- [Features](#features)
- [Demo](#demo)
- [Prerequisites](#-getting-started)
- [Getting started](#-getting-started)
</details>

### 🎯 Features

- 🔐 **Company**. Customers can be added to a specific company
- ⚡ **Spending Limits**. Company admins can assign spending limits to its employees
- 🌎 **Quotes**. Customers can request a quote from the store
- 🌎 **Quote Management**. Customers & Merchants can communicate, accept or reject quotes
- 🎨 **Order Edit**. Merchants can edit orders or quotes - add/remove item, update quantity & price

### Demo

### Prerequisites

- ✅ yarn version 3.5
- ✅ node 20
- ✅ Postgres 15
- ✅ Medusa 2.0

⚠️ We use turborepo to manage this monorepo and have tested this only with the above versions.

### 🚀 Getting started

```bash
# Clone the repository
git clone git@github.com:medusajs/b2b-starter-medusa.git

# Go to the folder
cd ./b2b-starter-medusa

# Install dependencies
yarn install

# Install packages
yarn build-packages

# Generate .env files for backend & storefront
yarn generate-env

# Create postgres database. If you want to create one with a different database name,
# make sure to update the POSTGRES_URL in the .env file at `./apps/backend/.env` before proceeding
createdb medusa-b2b-starter
```

```yaml
version: "3.8"

services:
  mafl:
    image: hywax/mafl
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./mafl/:/app/data/
```

### Node

First, clone the repository:

```shell
git clone https://github.com/hywax/mafl.git
```

Then install dependencies and build the production bundle (I'm using `yarn` here, you can use `npm` or `pnpm` if you like):

```shell
yarn install
yarn build
```

Finally, run the server:

```shell
yarn preview
```

The application will start with a basic configuration, which is located in the `data` folder.

### Contributors

<a href = "https://github.com/Tanu-N-Prabhu/Python/graphs/contributors">
  <img src = "https://contrib.rocks/image?repo=medusajs/b2b-starter-medusa"/>
</a>
