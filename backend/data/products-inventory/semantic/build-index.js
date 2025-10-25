#!/usr/bin/env node
/*
  build-index.js

  Constrói um índice semântico (JSON) a partir dos arquivos JSON dos distribuidores
  usando embeddings providos pelo Ollama (via comando CLI configurável).

  Requisitos mínimos:
  - Ollama instalado e rodando localmente OR um comando CLI configurado para gerar embeddings
  - Modelo de embeddings disponível no Ollama (ex: nomic-embed-text, gemma-emb, etc.)

  Como usar (PowerShell):
  $env:OLLAMA_EMBED_COMMAND = "ollama embed nomic-embed-text --stdin --json"
  node build-index.js

  Observações:
  - O script procura recursivamente por arquivos .json dentro do diretório pai (distributor_datasets)
  - Normaliza campos importantes (title, category, manufacturer, model, price, power, distributor)
  - Persiste `index.json` em ./semantic/index.json com: [ { id, title, metadata, text, embedding } ]
*/

const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..') // distributor_datasets
const OUT_FILE = path.join(__dirname, 'index.json')
const EMBED_CMD_ENV = 'OLLAMA_EMBED_COMMAND'

function collectJsonFiles(dir) {
    const files = []
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const e of entries) {
        const full = path.join(dir, e.name)
        if (e.isDirectory()) {
            // skip our own semantic folder
            if (path.resolve(full) === path.resolve(__dirname)) continue
            files.push(...collectJsonFiles(full))
        } else if (e.isFile() && e.name.toLowerCase().endsWith('.json')) {
            files.push(full)
        }
    }
    return files
}

function parsePrice(raw) {
    if (raw == null) return null
    if (typeof raw === 'number') return raw
    if (typeof raw === 'string') {
        // Examples: "R$ 490,00" or "490,00" or "490.00"
        const cleaned = raw.replace(/[R$\s]/g, '').replace(/\./g, '').replace(/,/, '.')
        const n = parseFloat(cleaned)
        return Number.isFinite(n) ? n : null
    }
    return null
}

function extractPower(item) {
    const candidates = [
        'power_w',
        'power',
        'potencia',
        'pmax_w',
        'pmax',
        'watts',
        'w'
    ]
    for (const k of candidates) {
        if (item[k] != null) return Number(item[k])
    }
    if (item.technical_specs && item.technical_specs.power_w) return Number(item.technical_specs.power_w)
    return null
}

function safeGet(obj, ...keys) {
    for (const k of keys) {
        if (!obj) return undefined
        if (obj[k] != null) return obj[k]
    }
    return undefined
}

function normalizeProduct(item, sourceFile) {
    const id = safeGet(item, 'id') || safeGet(item, 'sku') || `${path.basename(sourceFile)}::${Math.random().toString(36).slice(2, 8)}`
    const title = safeGet(item, 'title') || safeGet(item, 'name') || safeGet(item, 'model') || id
    const category = safeGet(item, 'category') || (sourceFile.includes('odex') ? 'odex-unknown' : (sourceFile.includes('solfacil') ? 'solfacil-unknown' : null))
    const manufacturer = safeGet(item, 'manufacturer') || safeGet(item, 'fabricante') || safeGet(item, 'brand') || safeGet(item, 'metadata', 'manufacturer')
    const model = safeGet(item, 'model') || safeGet(item, 'modelo') || safeGet(item, 'metadata', 'model')
    const series = safeGet(item, 'series') || safeGet(item, 'serie') || safeGet(item, 'metadata', 'series') || null
    const price = parsePrice(safeGet(item, 'pricing', 'price') || safeGet(item, 'price') || safeGet(item, 'preco'))
    const power = extractPower(item)
    const distributor = safeGet(item, 'source') || (sourceFile.includes('odex') ? 'odex' : (sourceFile.includes('solfacil') ? 'solfacil' : (sourceFile.includes('fotus') ? 'fotus' : path.basename(path.dirname(sourceFile)))))
    const description = safeGet(item, 'description') || safeGet(item, 'subtitle') || safeGet(item, 'metadata', 'description') || ''

    // Build a canonical searchable text that is rich in metadata
    const parts = []
    parts.push(`TITLE: ${title}`)
    if (manufacturer) parts.push(`MANUFACTURER: ${manufacturer}`)
    if (model) parts.push(`MODEL: ${model}`)
    if (series) parts.push(`SERIES: ${series}`)
    if (category) parts.push(`CATEGORY: ${category}`)
    if (distributor) parts.push(`DISTRIBUTOR: ${distributor}`)
    if (power) parts.push(`POWER_W: ${power}W`)
    if (price != null) parts.push(`PRICE_BRL: R$ ${price}`)
    if (description) parts.push(`DESCRIPTION: ${description}`)

    // Include a JSON dump of important metadata (compact)
    const metadata = {
        source_file: path.basename(sourceFile),
        id,
        title,
        category,
        manufacturer,
        model,
        series,
        price,
        power,
        distributor
    }

    const text = parts.join(' \n') + '\n\n' + `METADATA: ${JSON.stringify(metadata)}`

    return {
        id,
        title,
        category,
        manufacturer,
        model,
        series,
        price,
        power,
        distributor,
        description,
        metadata,
        text,
        raw: item
    }
}

function parseEmbeddingOutput(output) {
    const s = (output || '').trim()
    if (!s) return null
    // Try JSON
    try {
        const parsed = JSON.parse(s)
        // common shapes: { embedding: [...] } or [...]
        if (Array.isArray(parsed)) return parsed
        if (parsed.embedding && Array.isArray(parsed.embedding)) return parsed.embedding
        // If the model returns nested object { data: [{ embedding: [...] } ] }
        if (parsed.data && Array.isArray(parsed.data) && parsed.data[0] && Array.isArray(parsed.data[0].embedding)) return parsed.data[0].embedding
    } catch (e) {
        // not JSON
    }
    // Fallback: extract numbers via regex
    const nums = s.match(/[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?/g)
    if (nums && nums.length > 0) {
        return nums.map(n => parseFloat(n))
    }
    return null
}

function getEmbeddingSync(text) {
    const cmd = process.env[EMBED_CMD_ENV]
    if (!cmd) {
        throw new Error(`${EMBED_CMD_ENV} is not set. Please set it to a command that reads text from stdin and prints a JSON array embedding to stdout. Example (PowerShell): $env:OLLAMA_EMBED_COMMAND = "ollama embed nomic-embed-text --stdin --json"`)
    }

    console.log('⚙️  Generating embedding via command:', cmd.split(' ')[0])

    const res = spawnSync(cmd, { input: text, shell: true, encoding: 'utf-8', maxBuffer: 20 * 1024 * 1024 })

    if (res.error) {
        throw res.error
    }
    if (res.status !== 0) {
        console.warn('⚠️  Embed command exited with status', res.status)
        console.warn('stderr:', res.stderr)
    }

    const emb = parseEmbeddingOutput(res.stdout || res.stderr)
    if (!emb) {
        throw new Error('Could not parse embedding from command output. Please ensure your embed command prints a JSON array or an object with an `embedding` field.')
    }
    return emb
}

function buildIndex() {
    console.log('🔎 Scanning distributor files under', ROOT)
    const files = collectJsonFiles(ROOT)
    console.log(`Found ${files.length} JSON files. Filtering distributor files...`)

    // Keep only files under odex, solfacil, fotus or ones that look like product lists
    const interesting = files.filter(f => {
        const n = f.toLowerCase()
        return n.includes(path.join('distributor_datasets', 'odex').toLowerCase()) || n.includes(path.join('distributor_datasets', 'solfacil').toLowerCase()) || n.includes(path.join('distributor_datasets', 'fotus').toLowerCase()) || n.includes('unified')
    })

    console.log(`Indexing from ${interesting.length} candidate files`)

    const index = []
    let totalDocs = 0

    for (const file of interesting) {
        try {
            const raw = fs.readFileSync(file, 'utf-8')
            const data = JSON.parse(raw)
            const items = Array.isArray(data) ? data : [data]
            console.log(`  • ${path.basename(file)} => ${items.length} items`)

            for (const item of items) {
                const doc = normalizeProduct(item, file)
                // Avoid indexing empty docs
                if (!doc.text || doc.text.length < 20) continue

                // Generate embedding synchronously
                let embedding = null
                try {
                    embedding = getEmbeddingSync(doc.text)
                } catch (err) {
                    console.error('❌ Embedding error for', doc.id, err.message)
                    // continue without embedding - mark embedding null
                    embedding = null
                }

                index.push({
                    id: doc.id,
                    title: doc.title,
                    metadata: doc.metadata,
                    text: doc.text,
                    embedding
                })

                totalDocs += 1
            }

        } catch (err) {
            console.warn('⚠️  Skipping file (parse error):', file, err.message)
        }
    }

    console.log(`
✅ Index built. Documents: ${totalDocs}. Persisting to ${OUT_FILE}`)
    fs.writeFileSync(OUT_FILE, JSON.stringify({ meta: { generated_at: new Date().toISOString(), count: totalDocs }, docs: index }, null, 2), 'utf-8')
}

if (require.main === module) {
    try {
        buildIndex()
    } catch (err) {
        console.error('Fatal:', err.message)
        process.exit(1)
    }
}

module.exports = { buildIndex, collectJsonFiles, normalizeProduct }
