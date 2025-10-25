# Node-RED for YSH Data Pipeline

Visual workflow programming for rapid prototyping and testing.

## 🚀 Quick Start

### 1. Start Node-RED

```powershell
# Create network (if not exists)
docker network create ysh-pipeline-network

# Start Node-RED
docker-compose up -d

# View logs
docker-compose logs -f
```

### 2. Access Editor

```powershell
# Open browser
start http://localhost:1880

# No authentication required (local development)
```

### 3. Import Flows

1. Click menu (☰) → **Import**
2. Select **Local** tab
3. Choose `flows.json`
4. Click **Import**

## 📊 Available Flows

### 1. Daily Ingestion Flow

**Trigger**: Every day at 2 AM (cron: `00 02 * * *`)

**Nodes**:

- `Daily Trigger` → Inject node with cron schedule
- `Fetch ANEEL Data` → HTTP request to ANEEL API
- `Process ANEEL Response` → Extract datasets
- `Cache in Redis` → Store results
- `Trigger Ollama Processing` → AI enrichment
- `Index in Qdrant` → Vector storage
- `Send Notification` → Success message

### 2. Hourly Check Flow

**Trigger**: Every hour (`repeat: 3600`)

**Nodes**:

- `Hourly Check` → Inject node
- `Check Redis for Last Update` → Query cache
- `Need Update?` → Switch node (decision)
- `Fetch ANEEL Node` → If updates found
- `Skip - No Updates` → If data fresh

### 3. Error Handler Flow

**Trigger**: On any error

**Nodes**:

- `Global Error Handler` → Catch all errors
- `Log to CloudWatch` → Error logging
- `Retry with Backoff` → Exponential retry

## 🔧 Configuration

### Install Additional Nodes

Click menu (☰) → **Manage palette** → **Install**

**Recommended Nodes**:

```
node-red-contrib-redis
node-red-contrib-postgresql
node-red-contrib-aws
node-red-dashboard
node-red-contrib-telegrambot
```

### Configure Redis Connection

1. Drag **redis** node to canvas
2. Double-click to configure
3. Set **Host**: `ysh-redis-cache`
4. Set **Port**: `6379`
5. Click **Done**

### Configure Function Nodes

**Global Context** (available in function nodes):

```javascript
// Get Redis client
const redis = global.get('redis');

// Get environment variables
const ANEEL_API = env.get('ANEEL_API_URL');

// Set global variable
global.set('lastUpdate', new Date().toISOString());
```

## 📝 Creating Custom Flows

### Example: New Data Source

1. **Add Inject Node**
   - Set schedule or trigger
   - Configure topic if needed

2. **Add HTTP Request Node**
   - Set URL to data source
   - Configure headers/auth
   - Choose return type (JSON/string)

3. **Add Function Node**
   - Process response data
   - Extract relevant fields
   - Transform to standard format

4. **Add Storage Node**
   - Redis for caching
   - PostgreSQL for persistence
   - Qdrant for vectors

5. **Add Debug Node**
   - View processed data
   - Test flow execution

### Example Flow Code

```javascript
// Function node: Transform data
msg.payload = {
    id: msg.payload.guid,
    title: msg.payload.title,
    description: msg.payload.summary,
    timestamp: new Date().toISOString(),
    source: 'custom_source'
};

// Set status indicator
node.status({
    fill: "green",
    shape: "dot",
    text: "processed"
});

return msg;
```

## 🔄 Integration with Pipeline

### Call Python Pipeline

**Exec node**:

```bash
cd /opt/airflow/dags/pipeline && python integrated_data_pipeline.py
```

### Call Airflow DAG

**HTTP Request node**:

```
POST http://airflow-webserver:8080/api/v1/dags/daily_full_ingestion/dagRuns
Headers:
  Authorization: Basic YWlyZmxvdzphaXJmbG93
  Content-Type: application/json
Body:
  {"conf": {}}
```

### Call AWS Lambda

**AWS Lambda node** (requires `node-red-contrib-aws`):

```javascript
msg.payload = {
    FunctionName: 'ysh-aneel-fetcher',
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify({
        action: 'fetch_all'
    })
};
return msg;
```

## 📊 Dashboard Creation

### Install Dashboard

```powershell
# Install node-red-dashboard
# Via UI: Menu → Manage palette → Install → node-red-dashboard
```

### Add Dashboard Nodes

**Gauge** (show dataset count):

```
Drag gauge node → Configure:
  Label: "Datasets Processed"
  Min: 0
  Max: 100
  Units: "datasets"
```

**Chart** (show trends):

```
Drag chart node → Configure:
  Type: Line chart
  X-axis: Last 24 hours
  Y-axis: Dataset count
```

**Button** (trigger flow):

```
Drag button node → Configure:
  Label: "Trigger Ingestion"
  Payload: timestamp
```

### Access Dashboard

```powershell
start http://localhost:1880/ui
```

## 🛠️ Debugging

### Enable Debug Mode

1. Add **Debug** nodes after each processing step
2. Click **Debug** tab (🐛) in sidebar
3. View messages in real-time

### View Flow Logs

```powershell
# Container logs
docker logs -f ysh-node-red

# Follow specific flow
# Filter by node name in debug output
```

### Test Individual Nodes

1. Select node
2. Right-click → **Test node**
3. Or click inject node manually

## 📈 Performance Tips

1. **Use Context Storage**:

   ```javascript
   // Store in context instead of global
   context.set('myData', data);
   const data = context.get('myData');
   ```

2. **Batch Processing**:

   ```javascript
   // Process in batches of 100
   const batch = msg.payload.slice(0, 100);
   ```

3. **Async Operations**:

   ```javascript
   // Use async/await in function nodes
   const result = await fetchData();
   msg.payload = result;
   return msg;
   ```

## 🔐 Security (Production)

### Enable Authentication

Edit `settings.js`:

```javascript
adminAuth: {
    type: "credentials",
    users: [{
        username: "admin",
        password: "$2b$08$...", // bcrypt hash
        permissions: "*"
    }]
}
```

### Add HTTPS

Use reverse proxy (nginx):

```nginx
server {
    listen 443 ssl;
    server_name node-red.ysh.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:1880;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 📚 Export/Import

### Export Flow

1. Select nodes (or all)
2. Menu → **Export**
3. Choose **Formatted** or **Compact**
4. Copy JSON or download file

### Import Flow

1. Menu → **Import**
2. Paste JSON or select file
3. Choose **Current flow** or **New flow**
4. Click **Import**

## 🎯 Migration to Production

### Convert to Airflow

1. Test flow in Node-RED
2. Extract logic from function nodes
3. Create Python equivalent
4. Build Airflow DAG
5. Test in Airflow
6. Deploy to production

### Convert to AWS Step Functions

1. Export flow as JSON
2. Map nodes to Step Functions states
3. Convert to ASL (Amazon States Language)
4. Deploy via CloudFormation/Terraform

## 🤝 Collaboration

### Share Flows

1. Export flow to JSON
2. Commit to Git repository
3. Team members import

### Version Control

```powershell
# Track flows.json in Git
git add flows.json
git commit -m "feat: add hourly update flow"
git push
```

## 📝 Next Steps

1. ✅ Import provided flows
2. ✅ Test daily ingestion
3. ✅ Create custom dashboard
4. ✅ Add monitoring flows
5. ✅ Connect to external APIs
6. ✅ Export to Airflow
7. ✅ Deploy to production

---

**Ready to flow!** 🌊 Start Node-RED and build your workflows visually.
