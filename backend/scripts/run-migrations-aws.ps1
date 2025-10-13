# ===================================================================
# AWS RDS MIGRATIONS RUNNER
# ===================================================================
# Executa migrations do backend no RDS PostgreSQL da AWS
#
# OPÇÕES:
#   1. ECS Fargate Task (RECOMENDADO - seguro, auditável)
#   2. Local via Secret (rápido para dev/test)
#
# USAGE:
#   .\scripts\run-migrations-aws.ps1 -Method ecs
#   .\scripts\run-migrations-aws.ps1 -Method local
# ===================================================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("ecs", "local")]
    [string]$Method = "ecs",
    
    [Parameter(Mandatory=$false)]
    [string]$Profile = "ysh-production",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1",
    
    [Parameter(Mandatory=$false)]
    [string]$ClusterName = "ysh-backend-cluster",
    
    [Parameter(Mandatory=$false)]
    [string]$TaskDefinition = "ysh-backend-migrations",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# ===================================================================
# FUNÇÕES AUXILIARES
# ===================================================================

function Write-Header {
    param([string]$Message)
    Write-Host "`n$("="*70)" -ForegroundColor Cyan
    Write-Host " $Message" -ForegroundColor Yellow
    Write-Host "$("="*70)`n" -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Message)
    Write-Host "  ▶ $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "  ✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "  ✗ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "  ⚠ $Message" -ForegroundColor Yellow
}

function Get-DatabaseUrl {
    Write-Step "Obtendo DATABASE_URL do Secrets Manager..."
    
    try {
        $secretValue = aws secretsmanager get-secret-value `
            --secret-id "/ysh-b2b/database-url" `
            --profile $Profile `
            --region $Region `
            --query 'SecretString' `
            --output text 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "DATABASE_URL obtida com sucesso"
            return $secretValue
        } else {
            throw "Falha ao obter secret: $secretValue"
        }
    } catch {
        Write-Error "Erro ao obter DATABASE_URL: $_"
        throw
    }
}

function Test-RDSConnection {
    param([string]$DatabaseUrl)
    
    Write-Step "Testando conexão com RDS..."
    
    # Parse DATABASE_URL
    if ($DatabaseUrl -match 'postgres://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
        $user = $matches[1]
        $host = $matches[3]
        $port = $matches[4]
        $dbname = $matches[5]
        
        Write-Host "    Host: $host" -ForegroundColor Gray
        Write-Host "    Port: $port" -ForegroundColor Gray
        Write-Host "    Database: $dbname" -ForegroundColor Gray
        Write-Host "    User: $user" -ForegroundColor Gray
        
        return $true
    } else {
        Write-Error "DATABASE_URL em formato inválido"
        return $false
    }
}

function Get-ECSCluster {
    Write-Step "Verificando cluster ECS..."
    
    $cluster = aws ecs describe-clusters `
        --clusters $ClusterName `
        --profile $Profile `
        --region $Region `
        --query 'clusters[0].status' `
        --output text 2>&1
    
    if ($LASTEXITCODE -eq 0 -and $cluster -eq "ACTIVE") {
        Write-Success "Cluster '$ClusterName' está ativo"
        return $true
    } else {
        Write-Warning "Cluster '$ClusterName' não encontrado ou inativo"
        return $false
    }
}

function Get-VPCConfig {
    Write-Step "Obtendo configuração de VPC do RDS..."
    
    $vpcConfig = aws rds describe-db-instances `
        --db-instance-identifier production-ysh-b2b-postgres `
        --profile $Profile `
        --region $Region `
        --query 'DBInstances[0].[DBSubnetGroup.Subnets[*].SubnetIdentifier, VpcSecurityGroups[0].VpcSecurityGroupId]' `
        --output json | ConvertFrom-Json
    
    $subnets = $vpcConfig[0]
    $securityGroup = $vpcConfig[1]
    
    Write-Host "    Subnets: $($subnets -join ', ')" -ForegroundColor Gray
    Write-Host "    Security Group: $securityGroup" -ForegroundColor Gray
    
    return @{
        Subnets = $subnets
        SecurityGroup = $securityGroup
    }
}

function Create-ECSTaskDefinition {
    Write-Step "Criando Task Definition para migrations..."
    
    $databaseUrl = Get-DatabaseUrl
    $vpcConfig = Get-VPCConfig
    
    $taskDefJson = @{
        family = $TaskDefinition
        networkMode = "awsvpc"
        requiresCompatibilities = @("FARGATE")
        cpu = "512"
        memory = "1024"
        executionRoleArn = "arn:aws:iam::773235999227:role/ecsTaskExecutionRole"
        taskRoleArn = "arn:aws:iam::773235999227:role/ecsTaskRole"
        containerDefinitions = @(
            @{
                name = "migrations"
                image = "773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest"
                command = @("npm", "run", "migrate")
                essential = $true
                environment = @(
                    @{ name = "NODE_ENV"; value = "production" }
                    @{ name = "DATABASE_URL"; value = $databaseUrl }
                    @{ name = "MIGRATION_MODE"; value = "true" }
                )
                logConfiguration = @{
                    logDriver = "awslogs"
                    options = @{
                        "awslogs-group" = "/ecs/ysh-backend-migrations"
                        "awslogs-region" = $Region
                        "awslogs-stream-prefix" = "migrations"
                        "awslogs-create-group" = "true"
                    }
                }
            }
        )
    } | ConvertTo-Json -Depth 10 -Compress
    
    if ($DryRun) {
        Write-Warning "DRY RUN: Task Definition que seria criada:"
        $taskDefJson | ConvertFrom-Json | ConvertTo-Json -Depth 10
        return $null
    }
    
    $taskDefFile = [System.IO.Path]::GetTempFileName()
    $taskDefJson | Out-File -FilePath $taskDefFile -Encoding utf8
    
    try {
        $result = aws ecs register-task-definition `
            --cli-input-json "file://$taskDefFile" `
            --profile $Profile `
            --region $Region 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $taskDefArn = ($result | ConvertFrom-Json).taskDefinition.taskDefinitionArn
            Write-Success "Task Definition criada: $taskDefArn"
            return $taskDefArn
        } else {
            throw "Falha ao criar Task Definition: $result"
        }
    } finally {
        Remove-Item $taskDefFile -ErrorAction SilentlyContinue
    }
}

function Run-ECSMigrationTask {
    param([string]$TaskDefArn)
    
    Write-Step "Executando migration task no ECS..."
    
    $vpcConfig = Get-VPCConfig
    
    $runTaskJson = @{
        cluster = $ClusterName
        taskDefinition = $TaskDefArn
        launchType = "FARGATE"
        networkConfiguration = @{
            awsvpcConfiguration = @{
                subnets = $vpcConfig.Subnets
                securityGroups = @($vpcConfig.SecurityGroup)
                assignPublicIp = "DISABLED"
            }
        }
    } | ConvertTo-Json -Depth 10 -Compress
    
    if ($DryRun) {
        Write-Warning "DRY RUN: Comando que seria executado:"
        Write-Host $runTaskJson -ForegroundColor Gray
        return $null
    }
    
    $runTaskFile = [System.IO.Path]::GetTempFileName()
    $runTaskJson | Out-File -FilePath $runTaskFile -Encoding utf8
    
    try {
        $result = aws ecs run-task `
            --cli-input-json "file://$runTaskFile" `
            --profile $Profile `
            --region $Region 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $taskArn = ($result | ConvertFrom-Json).tasks[0].taskArn
            $taskId = $taskArn.Split('/')[-1]
            Write-Success "Migration task iniciada: $taskId"
            return $taskId
        } else {
            throw "Falha ao executar task: $result"
        }
    } finally {
        Remove-Item $runTaskFile -ErrorAction SilentlyContinue
    }
}

function Wait-ForTask {
    param([string]$TaskId)
    
    Write-Step "Aguardando conclusão da migration..."
    
    $maxWaitSeconds = 300 # 5 minutos
    $waitedSeconds = 0
    
    while ($waitedSeconds -lt $maxWaitSeconds) {
        $status = aws ecs describe-tasks `
            --cluster $ClusterName `
            --tasks $TaskId `
            --profile $Profile `
            --region $Region `
            --query 'tasks[0].lastStatus' `
            --output text 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`r    Status: $status (${waitedSeconds}s elapsed)" -NoNewline -ForegroundColor Gray
            
            if ($status -eq "STOPPED") {
                Write-Host "`n"
                
                # Verificar exit code
                $exitCode = aws ecs describe-tasks `
                    --cluster $ClusterName `
                    --tasks $TaskId `
                    --profile $Profile `
                    --region $Region `
                    --query 'tasks[0].containers[0].exitCode' `
                    --output text
                
                if ($exitCode -eq "0") {
                    Write-Success "Migration concluída com sucesso!"
                    return $true
                } else {
                    Write-Error "Migration falhou com exit code $exitCode"
                    return $false
                }
            }
        }
        
        Start-Sleep -Seconds 5
        $waitedSeconds += 5
    }
    
    Write-Host "`n"
    Write-Error "Timeout aguardando conclusão da task (${maxWaitSeconds}s)"
    return $false
}

function Get-TaskLogs {
    param([string]$TaskId)
    
    Write-Step "Obtendo logs da migration..."
    
    $logGroup = "/ecs/ysh-backend-migrations"
    $logStream = "migrations/$TaskId"
    
    try {
        $logs = aws logs get-log-events `
            --log-group-name $logGroup `
            --log-stream-name $logStream `
            --profile $Profile `
            --region $Region `
            --query 'events[*].message' `
            --output text 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n$("─"*70)" -ForegroundColor Gray
            Write-Host $logs -ForegroundColor White
            Write-Host "$("─"*70)`n" -ForegroundColor Gray
        } else {
            Write-Warning "Não foi possível obter logs (pode não estar disponível ainda)"
        }
    } catch {
        Write-Warning "Erro ao obter logs: $_"
    }
}

function Run-LocalMigration {
    Write-Warning "MÉTODO LOCAL: Executando migrations localmente conectando ao RDS"
    Write-Warning "ATENÇÃO: Seu IP precisa estar permitido no Security Group do RDS!"
    
    $databaseUrl = Get-DatabaseUrl
    
    if (-not (Test-RDSConnection -DatabaseUrl $databaseUrl)) {
        throw "Falha no teste de conexão"
    }
    
    Write-Step "Configurando DATABASE_URL localmente..."
    $env:DATABASE_URL = $databaseUrl
    
    Write-Step "Executando 'npm run migrate'..."
    
    if ($DryRun) {
        Write-Warning "DRY RUN: Comando que seria executado:"
        Write-Host "    npm run migrate" -ForegroundColor Gray
        return
    }
    
    try {
        npm run migrate
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Migrations executadas com sucesso!"
        } else {
            Write-Error "Migrations falharam com exit code $LASTEXITCODE"
            throw "Migration failed"
        }
    } finally {
        Remove-Item Env:\DATABASE_URL -ErrorAction SilentlyContinue
    }
}

function Validate-Migrations {
    Write-Step "Validando tabelas criadas..."
    
    $databaseUrl = Get-DatabaseUrl
    
    # Parse connection details
    if ($databaseUrl -match 'postgres://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
        $user = $matches[1]
        $password = $matches[2]
        $host = $matches[3]
        $port = $matches[4]
        $dbname = $matches[5]
        
        $env:PGPASSWORD = $password
        
        $tables = @(
            "lead",
            "event",
            "rag_query",
            "helio_conversation",
            "photogrammetry_analysis"
        )
        
        Write-Host "`n  Verificando tabelas criadas:" -ForegroundColor Yellow
        
        foreach ($table in $tables) {
            $query = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table';"
            
            try {
                $result = psql -h $host -p $port -U $user -d $dbname -t -c $query 2>&1
                
                if ($result -match '^\s*1\s*$') {
                    Write-Success "$table ✓"
                } else {
                    Write-Error "$table ✗ (não encontrada)"
                }
            } catch {
                Write-Warning "Erro ao verificar $table (psql pode não estar instalado)"
            }
        }
        
        Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    }
}

# ===================================================================
# MAIN EXECUTION
# ===================================================================

Write-Header "AWS RDS MIGRATIONS RUNNER"

Write-Host "  Configuração:" -ForegroundColor Yellow
Write-Host "    Método: $Method" -ForegroundColor White
Write-Host "    Profile: $Profile" -ForegroundColor White
Write-Host "    Region: $Region" -ForegroundColor White
Write-Host "    Dry Run: $DryRun`n" -ForegroundColor White

try {
    # Verificar credenciais AWS
    Write-Step "Verificando credenciais AWS..."
    $identity = aws sts get-caller-identity --profile $Profile 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Credenciais AWS inválidas ou expiradas. Execute: aws sso login --profile $Profile"
    }
    Write-Success "Credenciais AWS válidas"
    
    if ($Method -eq "ecs") {
        # ===================================================================
        # MÉTODO 1: ECS FARGATE (RECOMENDADO)
        # ===================================================================
        
        # Verificar se cluster existe
        if (-not (Get-ECSCluster)) {
            Write-Warning "Cluster ECS não existe. Criando cluster '$ClusterName'..."
            aws ecs create-cluster --cluster-name $ClusterName --profile $Profile --region $Region | Out-Null
            Write-Success "Cluster criado"
        }
        
        # Criar Task Definition
        $taskDefArn = Create-ECSTaskDefinition
        
        if ($DryRun) {
            Write-Success "DRY RUN concluído. Nenhuma alteração foi feita."
            exit 0
        }
        
        # Executar task
        $taskId = Run-ECSMigrationTask -TaskDefArn $taskDefArn
        
        # Aguardar conclusão
        $success = Wait-ForTask -TaskId $taskId
        
        # Obter logs
        Get-TaskLogs -TaskId $taskId
        
        if (-not $success) {
            throw "Migration task falhou"
        }
        
    } elseif ($Method -eq "local") {
        # ===================================================================
        # MÉTODO 2: LOCAL (RÁPIDO PARA DEV)
        # ===================================================================
        
        Run-LocalMigration
    }
    
    # Validar migrations
    Validate-Migrations
    
    Write-Header "✓ MIGRATIONS CONCLUÍDAS COM SUCESSO!"
    
    Write-Host "  Próximos passos:" -ForegroundColor Yellow
    Write-Host "    1. Verificar tabelas no RDS: SELECT * FROM lead LIMIT 1;" -ForegroundColor Cyan
    Write-Host "    2. Testar APIs: POST /store/leads, POST /store/events" -ForegroundColor Cyan
    Write-Host "    3. Deploy aplicação: Configurar ECS Service com nova imagem" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Header "✗ ERRO NA EXECUÇÃO DAS MIGRATIONS"
    Write-Error $_.Exception.Message
    Write-Host ""
    exit 1
}
