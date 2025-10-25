# Medusa B2B Starter com Docker# Medusa B2B Starter com Docker

Este projeto foi configurado para rodar com Docker containers no WSL.Este projeto foi configurado para rodar com Docker containers no WSL.

## Pré-requisitos## Pré-requisitos

- Docker- Docker

- Docker Compose- Docker Compose

- WSL (se estiver no Windows)- WSL (se estiver no Windows)

## Como usar## Como usar

### 1. Construir e iniciar os containers### 1. Construir e iniciar os containers

```bash```bash

docker-compose up --builddocker-compose up --build

``````



### 2. Executar migrações do banco de dados### 2. Executar migrações do banco de dados



Em um terminal separado, execute:Em um terminal separado, execute:



```bash```bash

docker-compose exec backend yarn medusa db:migratedocker-compose exec backend yarn medusa db:migrate

``````

### 3. Executar seed dos dados### 3. Executar seed dos dados

```bash```bash

docker-compose exec backend yarn run seeddocker-compose exec backend yarn run seed

``````



### 4. Criar usuário admin### 4. Criar usuário admin



```bash```bash

docker-compose exec backend yarn medusa user -e admin@test.com -p supersecret -i admindocker-compose exec backend yarn medusa user -e admin@test.com -p supersecret -i admin

``````

## Acessar as aplicações## Acessar as aplicações

- **Storefront**: [http://localhost:8000](http://localhost:8000)- **Storefront**: <http://localhost:8000>

- **Admin**: [http://localhost:9000/app](http://localhost:9000/app)- **Admin**: <http://localhost:9000/app>

  - Email: <admin@test.com>  - Email: <admin@test.com>

  - Senha: supersecret  - Senha: supersecret

## Comandos úteis## Comandos úteis

### Parar os containers### Parar os containers

```bash```bash

docker-compose downdocker-compose down

``````



### Ver logs### Ver logs



```bash```bash

docker-compose logs -fdocker-compose logs -f

``````

### Executar comandos no backend### Executar comandos no backend

```bash```bash

docker-compose exec backend <comando>docker-compose exec backend <comando>

``````



### Executar comandos no storefront### Executar comandos no storefront



```bash```bash

docker-compose exec storefront <comando>docker-compose exec storefront <comando>

``````

## Desenvolvimento## Desenvolvimento

Para desenvolvimento, os volumes estão montados, então as mudanças no código serão refletidas automaticamente.Para desenvolvimento, os volumes estão montados, então as mudanças no código serão refletidas automaticamente.

## Próximos passos## Próximos passos

1. Personalizar o design com o sistema YSH1. Personalizar o design com o sistema YSH

2. Transformar catálogo de produtos solares2. Transformar catálogo de produtos solares

3. Configurar módulos B2B para empresas solares3. Configurar módulos B2B para empresas solares
