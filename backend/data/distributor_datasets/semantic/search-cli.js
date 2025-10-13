#!/usr/bin/env node
/*
  search-cli.js

  CLI simples para executar buscas semânticas e RAG sobre o índice local.

  Exemplo:
    $env:OLLAMA_EMBED_COMMAND = "ollama embed nomic-embed-text --stdin --json"
    $env:OLLAMA_LLM_COMMAND = "ollama generate gemma3:27b --temperature 0.0"

    node search-cli.js build      # constrói ./index.json
    node search-cli.js search "inversor 5kW residencial" --top 10
    node search-cli.js rag "qual inversor 5kW escolher para casa?" --top 5
*/

const path = require('path')
const fs = require('fs')
const { buildIndex } = require('./build-index')
const { loadIndex, search, searchWithFilters, ragSearch } = require('./semantic-search')

const args = process.argv.slice(2)
if (args.length === 0) {
    console.log('Uso: node search-cli.js <build|search|rag> [query] [--top N]')
    process.exit(0)
}

const cmd = args[0]
if (cmd === 'build') {
    buildIndex()
    process.exit(0)
}

const topArgIndex = args.indexOf('--top')
let top = 10
if (topArgIndex >= 0 && args[topArgIndex + 1]) {
    top = parseInt(args[topArgIndex + 1], 10) || top
}

const indexFile = path.join(__dirname, 'index.json')
if (!fs.existsSync(indexFile)) {
    console.error('Index not found. Run `node search-cli.js build` first.')
    process.exit(1)
}

const index = loadIndex(indexFile)

if (cmd === 'search') {
    // Extract query and structured flags
    function extractQueryAndFlags(rawArgs) {
        const flags = {}
        const q = []
        let i = 0
        while (i < rawArgs.length) {
            const a = rawArgs[i]
            if (a.startsWith('--')) {
                const key = a.slice(2)
                const val = rawArgs[i + 1]
                if (val && !val.startsWith('--')) {
                    flags[key] = val
                    i += 2
                } else {
                    flags[key] = true
                    i += 1
                }
            } else {
                q.push(a)
                i += 1
            }
        }
        return { query: q.join(' ').trim(), flags }
    }

    const { query, flags } = extractQueryAndFlags(args.slice(1))
    if (!query) {
        console.error('Provide a query for search')
        process.exit(1)
    }

    // Map CLI flags into structured filters
    const filters = {}
    if (flags['manufacturer']) filters.manufacturer = flags['manufacturer']
    if (flags['category']) filters.category = flags['category']
    if (flags['model']) filters.model = flags['model']
    if (flags['series']) filters.series = flags['series']
    if (flags['distributor']) filters.distributor = flags['distributor']
    if (flags['price-min']) filters.price_min = Number(flags['price-min'])
    if (flags['price-max']) filters.price_max = Number(flags['price-max'])
    if (flags['power-min']) filters.power_min = Number(flags['power-min'])
    if (flags['power-max']) filters.power_max = Number(flags['power-max'])

    const useRerank = flags['rerank'] || false
    const candidateCount = flags['candidates'] ? Number(flags['candidates']) : 50

    let results = []
    if (useRerank) {
        // searchWithRerank will retrieve candidateCount items and re-rank them
        results = searchWithRerank(index, query, top, candidateCount)
    } else {
        results = Object.keys(filters).length > 0 ? searchWithFilters(index, query, filters, top) : search(index, query, top)
    }

    console.log(`\nTop ${results.length} results for: ${query}\n`)
    results.forEach((r, i) => {
        const m = r.doc.metadata
        console.log(`${i + 1}. [${(r.score || 0).toFixed(4)}] ${r.doc.title} — ${m.manufacturer || '-'} — ${m.distributor || '-'} — R$ ${m.price || '-'} — ${m.power_w ? m.power_w + 'W' : '-'} (ID: ${r.id})`)
    })
    process.exit(0)
}

if (cmd === 'rag') {
    // Accept same structured flags as search
    function extractQueryAndFlags(rawArgs) {
        const flags = {}
        const q = []
        let i = 0
        while (i < rawArgs.length) {
            const a = rawArgs[i]
            if (a.startsWith('--')) {
                const key = a.slice(2)
                const val = rawArgs[i + 1]
                if (val && !val.startsWith('--')) {
                    flags[key] = val
                    i += 2
                } else {
                    flags[key] = true
                    i += 1
                }
            } else {
                q.push(a)
                i += 1
            }
        }
        return { query: q.join(' ').trim(), flags }
    }

    const { query, flags } = extractQueryAndFlags(args.slice(1))
    if (!query) {
        console.error('Provide a query for rag')
        process.exit(1)
    }

    // allow filters to be passed to the underlying search
    const filters = {}
    if (flags['manufacturer']) filters.manufacturer = flags['manufacturer']
    if (flags['category']) filters.category = flags['category']
    if (flags['model']) filters.model = flags['model']
    if (flags['series']) filters.series = flags['series']
    if (flags['distributor']) filters.distributor = flags['distributor']
    if (flags['price-min']) filters.price_min = Number(flags['price-min'])
    if (flags['price-max']) filters.price_max = Number(flags['price-max'])
    if (flags['power-min']) filters.power_min = Number(flags['power-min'])
    if (flags['power-max']) filters.power_max = Number(flags['power-max'])

    const out = ragSearch(index, query, top)
    if (out.parsed) {
        console.log('\nRAG JSON\n', JSON.stringify(out.parsed, null, 2))
    } else {
        console.log('\nRAG RAW OUTPUT\n', out.raw)
        if (out.error) console.warn('\nERROR:', out.error)
    }
    process.exit(0)
}

console.error('Unknown command:', cmd)
process.exit(1)
