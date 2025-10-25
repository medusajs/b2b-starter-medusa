# Debug: Verificar CA Bundle no Container

## Criar Task Definition para Debug

Vamos criar uma task que **lista arquivos** para confirmar se `/tmp/rds-ca-bundle.pem` existe:

```bash
aws ecs run-task \
  --cluster production-ysh-b2b-cluster \
  --task-definition ysh-b2b-backend-migrations:3 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-0f561c79c40d11c6f,subnet-03634efd78a887b0b],securityGroups=[sg-06563301eba0427b2],assignPublicIp=ENABLED}" \
  --overrides '{"containerOverrides":[{"name":"migrations","command":["sh","-c","ls -la /tmp/rds-ca-bundle.pem && cat /tmp/rds-ca-bundle.pem | head -5"]}]}' \
  --region us-east-1 \
  --query 'tasks[0].taskArn' \
  --output text
```

**Aguardar e obter logs**:

```bash
# Substituir TASK_ID
aws logs get-log-events \
  --log-group-name "/ecs/ysh-b2b-backend-migrations" \
  --log-stream-name "ecs/migrations/TASK_ID" \
  --limit 100 \
  --region us-east-1 \
  --query 'events[*].message' \
  --output text
```

---

## Se Arquivo NÃO Existir

O problema está no Dockerfile build. Verifique se image v1.0.2 foi buildada corretamente:

```bash
# Verificar tags da imagem
aws ecr describe-images \
  --repository-name ysh-b2b-backend \
  --image-ids imageTag=v1.0.2 \
  --region us-east-1 \
  --query 'imageDetails[0].[imagePushedAt,imageSizeInBytes]' \
  --output json
```

---

## Se Arquivo EXISTE

O problema é que `resolveDatabaseSslConfig()` roda **antes** do Medusa carregar.

**Solução**: Modificar `DATABASE_URL` para **NÃO usar `?sslmode=require`** (confiar apenas nas variáveis DATABASE_SSL*):

```bash
aws secretsmanager update-secret \
  --secret-id /ysh-b2b/database-url \
  --secret-string "postgresql://medusa_user:bJwPx-g-u9%3flt!O%5b%5bEG2%3aKzj%5bcs%7e@production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com:5432/medusa_db" \
  --region us-east-1
```

**Remover `?sslmode=require`** porque pode causar **conflito** entre URL sslmode e config object ssl.

---

## Hipótese: pg Driver Ignora ssl Config Object Quando URL Tem ?sslmode

O `pg` driver do Node.js pode **priorizar** query parameters da URL sobre o config object.

**Test case**: Remover `?sslmode=require` da URL e deixar apenas:

```javascript
{
  connectionString: "postgresql://user:pass@host:5432/db",  // SEM ?sslmode
  ssl: {
    rejectUnauthorized: true,
    ca: readFileSync('/tmp/rds-ca-bundle.pem', 'utf8')
  }
}
```

Isso força o driver a usar o objeto `ssl` em vez do query parameter.
