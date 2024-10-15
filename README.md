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

&nbsp;

### 🎯 Features

- 🔐 **Company Management**. Customers can manage their company and invite employees.
- ⚡ **Spending Limits**. Company admins can assign spending limits to its employees
- 🚀 **Bulk add-to-cart**. Customers can add multiple variants of a product to their cart at once.
- 📄 **Quote Management**. Customers & Merchants can communicate, accept or reject quotes
- ✏️ **Order Edit**. Merchants can edit orders or quotes - add/remove item, update quantity & price
- 🛍️ **Next.js storefront**. All new storefront running on Next.js 14, featuring product lists, product pages, cart, checkout, account management and more.

&nbsp;

### Demo

#### Quote Management

<img align="right" src="https://github.com/user-attachments/assets/fa53e46a-8f22-40d5-a761-52bf397be191" alt="image" style=: />
&nbsp;

#### Company Management

<img align="right" src="https://github.com/user-attachments/assets/91afa2e7-4d10-4f41-8319-88e5c4fccf20" alt="image" style=: />
&nbsp;

#### Cart Summary

<img align="right" src="https://github.com/user-attachments/assets/0401450a-196b-4a28-ba1c-0224d64d510b" alt="image" style=: />
&nbsp;

#### Product Page

<img align="right" src="https://github.com/user-attachments/assets/8b077e9c-eade-453c-9145-ddca2acbcad2" alt="image" style=: />
&nbsp;

### Prerequisites

- ✅ yarn version 3.5
- ✅ node 20
- ✅ Postgres 15
- ✅ Medusa 2.0

⚠️ We use turborepo to manage this monorepo and have tested this only with the above versions.

&nbsp;

### 🚀 Getting started

#### Setup monorepo

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

# Setup database
yarn setup-db

# Start Servers - storefront & backend
yarn dev
```

#### Setup publishable key

- ✅ Visit [Admin: Publishable Key](http://localhost:9000/app/settings/publishable-api-keys)
  - <b>Credentials</b>:
    - <b>email</b>: `admin@test.com`
    - <b>password</b>: `supersecret`
- ✅ Copy token key of "Webshop"
- ✅ Open file - `apps/storefront/.env`
- ✅ Add token to this var - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`

#### Links

- [Medusa Admin](http://localhost:9000/app)
- [Medusa Storefront](http://localhost:8000)

You are good to go! 🚀

&nbsp;

### Contributors

<a href = "https://github.com/Tanu-N-Prabhu/Python/graphs/contributors">
  <img src = "https://contrib.rocks/image?repo=medusajs/b2b-starter-medusa"/>
</a>
