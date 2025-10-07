# ==========================================
# Configuração de Rede Podman Otimizada
# Para ambiente de desenvolvimento
# ==========================================

# Criar rede personalizada para desenvolvimento
podman network create ysh-b2b-dev-network \
    --driver bridge \
    --subnet 172.25.0.0/16 \
    --gateway 172.25.0.1 \
    --opt com.docker.network.bridge.enable_icc=true \
    --opt com.docker.network.bridge.enable_ip_masquerade=true \
    --opt com.docker.network.bridge.host_binding_ipv4=0.0.0.0 \
    --opt com.docker.network.driver.mtu=1500

# Configurações de DNS personalizadas (opcional)
# podman network create ysh-b2b-dev-network \
#     --dns 8.8.8.8 \
#     --dns 8.8.4.4

# Verificar rede criada
echo "Rede criada com sucesso:"
podman network inspect ysh-b2b-dev-network

# Listar todas as redes
echo "Redes disponíveis:"
podman network ls