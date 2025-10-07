# ==========================================
# Configuração de Volumes Podman Otimizada
# Para persistência de dados em desenvolvimento
# ==========================================

# Criar volumes nomeados para persistência
echo "Criando volumes de desenvolvimento..."

# Volume para dados PostgreSQL
podman volume create postgres_dev_data \
    --driver local \
    --opt type=bind \
    --opt device=$PWD/data/postgres \
    --opt o=bind

# Volume para dados Redis
podman volume create redis_dev_data \
    --driver local \
    --opt type=bind \
    --opt device=$PWD/data/redis \
    --opt o=bind

# Volume para uploads do backend
podman volume create backend_dev_uploads \
    --driver local \
    --opt type=bind \
    --opt device=$PWD/data/uploads \
    --opt o=bind

# Volume para cache do Node.js
podman volume create node_modules_cache \
    --driver local

# Volume para cache do Next.js build
podman volume create nextjs_cache \
    --driver local

# Criar diretórios locais se não existirem
mkdir -p data/postgres data/redis data/uploads

echo "Volumes criados:"
podman volume ls

echo "Detalhes dos volumes:"
podman volume inspect postgres_dev_data redis_dev_data backend_dev_uploads