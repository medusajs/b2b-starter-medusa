#!/bin/bash
# Script de automação completa do Publishable Key para ambientes local e AWS

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/../backend"
STOREFRONT_DIR="$SCRIPT_DIR/../storefront"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔑 Automação do Publishable Key${NC}\n"

# Função para exibir menu
show_menu() {
  echo "Escolha o ambiente:"
  echo "  1) Local (npm run setup)"
  echo "  2) Docker (extrair do container)"
  echo "  3) AWS ECS (verificar/atualizar secret)"
  echo "  4) Validar configuração atual"
  echo "  5) Sair"
  echo ""
  read -p "Opção: " choice
  echo ""
}

# Função para setup local
setup_local() {
  echo -e "${BLUE}📦 Setup Local${NC}\n"
  
  cd "$BACKEND_DIR"
  
  # Verificar se backend está rodando
  if ! curl -s http://localhost:9000/health > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Backend não está rodando${NC}"
    echo -e "${YELLOW}   Inicie com: cd backend && npm run dev${NC}\n"
    return 1
  fi
  
  echo -e "${GREEN}✅ Backend está rodando${NC}\n"
  
  # Executar script de setup
  echo -e "${BLUE}🔨 Executando setup do publishable key...${NC}\n"
  node scripts/setup-publishable-key.js
  
  echo -e "\n${GREEN}✅ Setup local concluído!${NC}\n"
  
  # Perguntar se quer fazer upload para AWS
  read -p "Fazer upload para AWS Secrets Manager? (y/n): " upload_choice
  if [[ "$upload_choice" == "y" || "$upload_choice" == "Y" ]]; then
    node scripts/setup-publishable-key.js --upload
    echo -e "\n${GREEN}✅ Upload para AWS concluído!${NC}\n"
  fi
}

# Função para extrair do Docker
setup_docker() {
  echo -e "${BLUE}🐳 Setup Docker${NC}\n"
  
  # Verificar se containers estão rodando
  if ! docker-compose ps backend | grep -q "Up"; then
    echo -e "${RED}❌ Container backend não está rodando${NC}"
    echo -e "${YELLOW}   Inicie com: docker-compose up -d${NC}\n"
    return 1
  fi
  
  echo -e "${GREEN}✅ Containers estão rodando${NC}\n"
  
  # Extrair key
  echo -e "${BLUE}🔍 Extraindo publishable key do container...${NC}\n"
  
  KEY=$(docker-compose exec -T backend npm run medusa exec ./src/scripts/create-publishable-key.ts 2>&1 | grep -oP 'pk_[a-f0-9]+' | head -1)
  
  if [ -z "$KEY" ]; then
    echo -e "${RED}❌ Nenhuma key encontrada${NC}"
    echo -e "${YELLOW}   Execute o seed primeiro: docker-compose exec backend npm run seed${NC}\n"
    return 1
  fi
  
  echo -e "${GREEN}✅ Key encontrada: $KEY${NC}\n"
  
  # Salvar em .env files
  echo "" >> "$BACKEND_DIR/.env"
  echo "# Publishable Key (extraído em $(date))" >> "$BACKEND_DIR/.env"
  echo "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$KEY" >> "$BACKEND_DIR/.env"
  
  echo "" >> "$STOREFRONT_DIR/.env.local"
  echo "# Publishable Key (extraído em $(date))" >> "$STOREFRONT_DIR/.env.local"
  echo "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$KEY" >> "$STOREFRONT_DIR/.env.local"
  
  echo -e "${GREEN}💾 Key salva nos arquivos .env${NC}\n"
  
  # Perguntar se quer reiniciar containers
  read -p "Reiniciar containers? (y/n): " restart_choice
  if [[ "$restart_choice" == "y" || "$restart_choice" == "Y" ]]; then
    echo -e "\n${BLUE}🔄 Reiniciando containers...${NC}\n"
    docker-compose restart backend storefront
    echo -e "${GREEN}✅ Containers reiniciados!${NC}\n"
  fi
}

# Função para verificar/atualizar AWS
setup_aws() {
  echo -e "${BLUE}☁️  Setup AWS ECS${NC}\n"
  
  # Verificar se AWS CLI está configurado
  if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo -e "${RED}❌ AWS CLI não está configurado${NC}"
    echo -e "${YELLOW}   Configure com: aws configure${NC}\n"
    return 1
  fi
  
  echo -e "${GREEN}✅ AWS CLI configurado${NC}\n"
  
  # Verificar secret atual
  echo -e "${BLUE}🔍 Verificando secret atual...${NC}\n"
  
  CURRENT_KEY=$(aws secretsmanager get-secret-value \
    --secret-id /ysh-b2b/publishable-key \
    --region us-east-1 \
    --query 'SecretString' \
    --output text 2>/dev/null || echo "")
  
  if [ -n "$CURRENT_KEY" ]; then
    echo -e "${GREEN}✅ Secret já existe: $CURRENT_KEY${NC}\n"
    
    read -p "Deseja atualizar o secret? (y/n): " update_choice
    if [[ "$update_choice" != "y" && "$update_choice" != "Y" ]]; then
      return 0
    fi
  else
    echo -e "${YELLOW}⚠️  Secret não existe, será criado${NC}\n"
  fi
  
  # Pedir nova key ou extrair do banco
  echo "Como obter a key?"
  echo "  1) Informar key manualmente"
  echo "  2) Executar task migrations+seed no ECS (recomendado)"
  read -p "Opção: " key_source
  
  if [ "$key_source" == "1" ]; then
    read -p "Cole a publishable key (pk_xxx): " NEW_KEY
  else
    echo -e "\n${BLUE}🚀 Executando task migrations+seed...${NC}\n"
    
    TASK_ARN=$(aws ecs run-task \
      --cluster production-ysh-b2b-cluster \
      --task-definition ysh-b2b-backend-migrations-with-seed:1 \
      --launch-type FARGATE \
      --network-configuration "awsvpcConfiguration={subnets=[subnet-0f561c79c40d11c6f,subnet-03634efd78a887b0b],securityGroups=[sg-06563301eba0427b2],assignPublicIp=ENABLED}" \
      --region us-east-1 \
      --query 'tasks[0].taskArn' \
      --output text)
    
    TASK_ID=$(echo "$TASK_ARN" | grep -oP '[^/]+$')
    
    echo -e "${GREEN}✅ Task iniciada: $TASK_ID${NC}\n"
    echo -e "${YELLOW}⏳ Aguardando conclusão (3-5 minutos)...${NC}\n"
    
    # Aguardar task completar
    while true; do
      STATUS=$(aws ecs describe-tasks \
        --cluster production-ysh-b2b-cluster \
        --tasks "$TASK_ID" \
        --region us-east-1 \
        --query 'tasks[0].lastStatus' \
        --output text)
      
      if [ "$STATUS" == "STOPPED" ]; then
        break
      fi
      
      echo -e "${YELLOW}   Status: $STATUS${NC}"
      sleep 15
    done
    
    echo -e "\n${GREEN}✅ Task concluída!${NC}\n"
    
    # Extrair key dos logs
    echo -e "${BLUE}🔍 Extraindo key dos logs...${NC}\n"
    
    NEW_KEY=$(aws logs get-log-events \
      --log-group-name "/ecs/ysh-b2b-backend-migrations-with-seed" \
      --log-stream-name "ecs/migrations-and-seed/$TASK_ID" \
      --limit 200 \
      --region us-east-1 \
      --query 'events[*].message' \
      --output text | grep -oP 'pk_[a-f0-9]+' | head -1)
    
    if [ -z "$NEW_KEY" ]; then
      echo -e "${RED}❌ Não foi possível extrair key dos logs${NC}\n"
      return 1
    fi
    
    echo -e "${GREEN}✅ Key extraída: $NEW_KEY${NC}\n"
  fi
  
  # Atualizar secret
  echo -e "${BLUE}📝 Atualizando secret...${NC}\n"
  
  aws secretsmanager update-secret \
    --secret-id /ysh-b2b/publishable-key \
    --secret-string "$NEW_KEY" \
    --region us-east-1 > /dev/null
  
  echo -e "${GREEN}✅ Secret atualizado com sucesso!${NC}\n"
  echo -e "${BLUE}📋 Próximos passos:${NC}"
  echo -e "   1. Verifique que backend task definition referencia o secret"
  echo -e "   2. Force new deployment do backend service"
  echo -e "   3. Valide health check do backend\n"
}

# Função para validar configuração
validate_config() {
  echo -e "${BLUE}🔍 Validando Configuração${NC}\n"
  
  # Backend .env
  if grep -q "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY" "$BACKEND_DIR/.env" 2>/dev/null; then
    BACKEND_KEY=$(grep "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY" "$BACKEND_DIR/.env" | cut -d'=' -f2)
    echo -e "${GREEN}✅ Backend .env: $BACKEND_KEY${NC}"
  else
    echo -e "${RED}❌ Backend .env: KEY NÃO ENCONTRADA${NC}"
  fi
  
  # Storefront .env.local
  if grep -q "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY" "$STOREFRONT_DIR/.env.local" 2>/dev/null; then
    STOREFRONT_KEY=$(grep "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY" "$STOREFRONT_DIR/.env.local" | cut -d'=' -f2)
    echo -e "${GREEN}✅ Storefront .env.local: $STOREFRONT_KEY${NC}"
  else
    echo -e "${RED}❌ Storefront .env.local: KEY NÃO ENCONTRADA${NC}"
  fi
  
  # AWS Secret
  AWS_KEY=$(aws secretsmanager get-secret-value \
    --secret-id /ysh-b2b/publishable-key \
    --region us-east-1 \
    --query 'SecretString' \
    --output text 2>/dev/null || echo "")
  
  if [ -n "$AWS_KEY" ]; then
    echo -e "${GREEN}✅ AWS Secrets Manager: $AWS_KEY${NC}"
  else
    echo -e "${YELLOW}⚠️  AWS Secrets Manager: SECRET NÃO ENCONTRADO${NC}"
  fi
  
  echo ""
  
  # Testar API
  if [ -n "$BACKEND_KEY" ]; then
    echo -e "${BLUE}🧪 Testando API...${NC}\n"
    
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
      -H "x-publishable-api-key: $BACKEND_KEY" \
      http://localhost:9000/store/products?limit=1)
    
    if [ "$RESPONSE" == "200" ]; then
      echo -e "${GREEN}✅ API respondeu com sucesso (200)${NC}\n"
    else
      echo -e "${RED}❌ API falhou (HTTP $RESPONSE)${NC}\n"
    fi
  fi
}

# Loop do menu
while true; do
  show_menu
  
  case $choice in
    1)
      setup_local
      ;;
    2)
      setup_docker
      ;;
    3)
      setup_aws
      ;;
    4)
      validate_config
      ;;
    5)
      echo -e "${BLUE}👋 Saindo...${NC}\n"
      exit 0
      ;;
    *)
      echo -e "${RED}❌ Opção inválida${NC}\n"
      ;;
  esac
  
  echo ""
  read -p "Pressione ENTER para continuar..."
  clear
done
