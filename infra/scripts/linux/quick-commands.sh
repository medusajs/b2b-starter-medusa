#!/bin/bash

# Commands to execute in WSL terminal step by step
echo "=== WSL Setup Commands - Execute in order ==="

echo "
1. First, navigate to your home and make scripts executable:
"
echo "cd ~"
echo "chmod +x infra/scripts/linux/*.sh"

echo "
2. Run the complete system setup:
"
echo "./infra/scripts/linux/fedora-debian-setup.sh"

echo "
3. After system setup, reload shell:
"
echo "source ~/.zshrc"

echo "
4. Run project-specific setup:
"
echo "./infra/scripts/linux/ysh-project-setup.sh"

echo "
5. Configure environment files:
"
echo "cd backend && cp .env.template .env && nano .env"
echo "cd ../storefront && cp .env.local.template .env.local && nano .env.local"

echo "
6. Start development environment:
"
echo "cd .. && ./start-dev.sh"

echo "
=== Ready to start! ==="