/*
  semantic-search.js

  Biblioteca mínima para buscar semanticamente dentro do índice construído por build-index.js
  - Busca por similaridade (cosine)
  - RAG (recupera docs e pede ao LLM uma resposta consolidada)

  Dependências de ambiente:
  - OLLAMA_EMBED_COMMAND (para gerar embeddings de queries)
  - OLLAMA_LLM_COMMAND (para gerar resposta via LLM)

  Exemplo de uso:
    const { loadIndex, search, ragSearch } = require('./semantic-search')
    const idx = loadIndex('./index.json')
    const results = search(idx, 'inversor 5kW residencial', 10)
    const answer = ragSearch(idx, 'o melhor inversor 5kW para residencia?', 5)
*/

const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const EMBED_CMD_ENV = 'OLLAMA_EMBED_COMMAND'
const LLM_CMD_ENV = 'OLLAMA_LLM_COMMAND'

function loadIndex(indexFile) {
    if (!fs.existsSync(indexFile)) throw new Error('Index file not found: ' + indexFile)
    const raw = fs.readFileSync(indexFile, 'utf-8')
    const parsed = JSON.parse(raw)
    return parsed
}

function dot(a, b) {
    let s = 0
    for (let i = 0; i < a.length; i++) s += a[i] * b[i]
    return s
}

function norm(a) {
    let s = 0
    for (let i = 0; i < a.length; i++) s += a[i] * a[i]
    return Math.sqrt(s)
}

function cosineSimilarity(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return -1
    if (a.length !== b.length) return -1
    const num = dot(a, b)
    const den = norm(a) * norm(b)
    if (den === 0) return -1
    return num / den
}

function parseEmbeddingOutput(output) {
    const s = (output || '').trim()
    if (!s) return null
    try {
        const parsed = JSON.parse(s)
        if (Array.isArray(parsed)) return parsed
        if (parsed.embedding && Array.isArray(parsed.embedding)) return parsed.embedding
        if (parsed.data && Array.isArray(parsed.data) && parsed.data[0] && Array.isArray(parsed.data[0].embedding)) return parsed.data[0].embedding
    } catch (e) {
        // fallback: parse numbers
    }
    const nums = s.match(/[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?/g)
    if (nums && nums.length > 0) return nums.map(n => parseFloat(n))
    return null
}

function getQueryEmbeddingSync(text) {
    const cmd = process.env[EMBED_CMD_ENV]
    if (!cmd) throw new Error(`${EMBED_CMD_ENV} is not set. Set it to a command that reads stdin and prints embedding JSON array.`)
    const res = spawnSync(cmd, { input: text, shell: true, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 })
    if (res.error) throw res.error
    const emb = parseEmbeddingOutput(res.stdout || res.stderr)
    if (!emb) throw new Error('Failed to parse embedding for query')
    return emb
}

function search(index, query, topK = 10) {
    // index: { meta:..., docs: [ { id, title, metadata, text, embedding } ] }
    const docs = index.docs || []
    const qEmb = getQueryEmbeddingSync(query)
    const scores = []
    for (const d of docs) {
        if (!d.embedding) continue
        const sim = cosineSimilarity(qEmb, d.embedding)
        scores.push({ id: d.id, score: sim, doc: d })
    }
    const sorted = scores.sort((a, b) => b.score - a.score).slice(0, topK)
    return sorted
}

/**
 * Filter candidates by structured filters (category, manufacturer, model, series, price, power, distributor)
 */
function docMatchesFilters(d, filters) {
    if (!filters) return true
    const m = d.metadata || {}
    if (filters.category && (m.category || '').toString().toLowerCase() !== filters.category.toString().toLowerCase()) return false
    if (filters.manufacturer && (m.manufacturer || '').toString().toLowerCase() !== filters.manufacturer.toString().toLowerCase()) return false
    if (filters.model && (m.model || '').toString().toLowerCase() !== filters.model.toString().toLowerCase()) return false
    if (filters.series && (m.series || '').toString().toLowerCase() !== filters.series.toString().toLowerCase()) return false
    if (filters.distributor && (m.distributor || '').toString().toLowerCase() !== filters.distributor.toString().toLowerCase()) return false
    if (filters.price_min != null && (m.price == null || Number(m.price) < Number(filters.price_min))) return false
    if (filters.price_max != null && (m.price == null || Number(m.price) > Number(filters.price_max))) return false
    if (filters.power_min != null && (m.power_w == null || Number(m.power_w) < Number(filters.power_min))) return false
    if (filters.power_max != null && (m.power_w == null || Number(m.power_w) > Number(filters.power_max))) return false
    return true
}

/**
 * Search with structured filters applied before semantic ranking.
 */
function searchWithFilters(index, query, filters = {}, topK = 10) {
    const docs = (index.docs || []).filter(d => docMatchesFilters(d, filters))
    if (docs.length === 0) return []
    const qEmb = getQueryEmbeddingSync(query)
    const scores = []
    for (const d of docs) {
        if (!d.embedding) continue
        const sim = cosineSimilarity(qEmb, d.embedding)
        scores.push({ id: d.id, score: sim, doc: d })
    }
    return scores.sort((a, b) => b.score - a.score).slice(0, topK)
}

/**
 * Rerank a set of candidate documents using the LLM (Gemma3 / configured model).
 * Espera uma lista de hits no formato { id, score, doc } e retorna um array com { id, score, reason }
 */
function rerankDocs(hits, query) {
    if (!hits || hits.length === 0) return []

    // Build a compact context for the LLM
    const docsForPrompt = hits.map((h, i) => {
        const m = h.doc.metadata || {}
        const snippet = (h.doc.text || '').slice(0, 400)
        return `${i + 1}. ID: ${h.id} | TITLE: ${h.doc.title} | MANUFACTURER: ${m.manufacturer || '-'} | PRICE: ${m.price || '-'} | POWER_W: ${m.power_w || '-'} | DISTRIBUTOR: ${m.distributor || '-'}\nSNIPPET: ${snippet}`
    }).join('\n\n')

    const prompt = `Você é um engenheiro especialista em sistemas fotovoltaicos. Você receberá uma query de cliente e uma lista de documentos candidatos com informações resumidas. Para cada documento, avalie de 0 a 100 a adequação para responder a query.

Query: ${query}

Documentos candidatos:\n\n${docsForPrompt}

RETORNE APENAS UM JSON ARRAY com objetos { "id": "docid", "score": number, "reason": "motivo curto" } ordenado do mais relevante para o menos relevante.`

    const out = generateWithLLMSync(prompt)
    const match = out.match(/\[[\s\S]*\]/)
    if (!match) {
        // fallback: return the original ranking
        return hits.map(h => ({ id: h.id, score: h.score, reason: 'original-ranking' }))
    }
    try {
        const parsed = JSON.parse(match[0])
        // normalizar: retornar somente os ids que existem nos hits
        const hitIds = new Set(hits.map(h => h.id))
        return parsed.filter(p => p && hitIds.has(p.id)).map(p => ({ id: p.id, score: Number(p.score || 0), reason: p.reason || '' }))
    } catch (err) {
        return hits.map(h => ({ id: h.id, score: h.score, reason: 'parse-error' }))
    }
}

/**
 * Search + optional rerank via LLM. CandidateCount controls how many neighbors will be sent to the LLM for re-ranking.
 */
function searchWithRerank(index, query, topK = 10, candidateCount = 50) {
    // candidateCount is number of items fetched by embeddings before re-ranking
    const candidates = search(index, query, candidateCount)
    if (!candidates || candidates.length === 0) return []
    const reranked = rerankDocs(candidates, query)
    // Map reranked into original doc objects with new score
    const idToDoc = new Map(candidates.map(c => [c.id, c.doc]))
    const merged = reranked.map(r => ({ id: r.id, score: r.score, doc: idToDoc.get(r.id) })).filter(x => x.doc)
    // Trim to topK
    return merged.slice(0, topK)
}

function generateWithLLMSync(prompt) {
    const cmd = process.env[LLM_CMD_ENV]
    if (!cmd) throw new Error(`${LLM_CMD_ENV} is not set. Set it to your Ollama generate command (e.g. "ollama generate gemma3:27b --temp 0.0")`)
    const res = spawnSync(cmd, { input: prompt, shell: true, encoding: 'utf-8', maxBuffer: 20 * 1024 * 1024 })
    if (res.error) throw res.error
    if (res.status !== 0) console.warn('LLM command exited with', res.status, 'stderr:', res.stderr)
    return (res.stdout || res.stderr || '').toString()
}

function buildContextFromDocs(hitDocs, maxChars = 4000) {
    const parts = []
    for (const hit of hitDocs) {
        const d = hit.doc
        const snippet = (d.text || '').slice(0, 1000)
        parts.push(`DOC_ID: ${d.id}\nTITLE: ${d.title}\nMANUFACTURER: ${d.metadata.manufacturer}\nCATEGORY: ${d.metadata.category}\nDISTRIBUTOR: ${d.metadata.distributor}\nPRICE: ${d.metadata.price}\nPOWER_W: ${d.metadata.power_w}\n---\n${snippet}\n`)
        if (parts.join('\n').length > maxChars) break
    }
    return parts.join('\n\n')
}

function ragSearch(index, query, topK = 5) {
    // 1. semantic search
    const hits = search(index, query, topK)

    // 2. build context
    const context = buildContextFromDocs(hits, 8000)

    // 3. prompt LLM for answer with citations
    const prompt = `Você é um especialista em sistemas fotovoltaicos. Use os documentos abaixo para responder a pergunta do usuário de forma objetiva e técnica. Inclua referências (DOC_ID) quando mencionar produtos ou números.

DOCUMENTOS:\n${context}

PERGUNTA: ${query}

FORMATO DE SAÍDA: JSON com os campos: {"answer": string, "sources": [{"id": string, "title": string, "score": number, "distributor": string}], "recommendations": [{"id": string, "title": string, "why": string}]}

Responda APENAS o JSON.
`

    const llmOutput = generateWithLLMSync(prompt)

    // Tente extrair JSON da saída
    const jsonMatch = llmOutput.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch[0])
            return { raw: llmOutput, parsed }
        } catch (err) {
            // parse failed
            return { raw: llmOutput, error: 'Failed to parse JSON from LLM output' }
        }
    }
    return { raw: llmOutput, error: 'No JSON block found in LLM output' }
}

module.exports = { loadIndex, search, searchWithFilters, searchWithRerank, rerankDocs, ragSearch, cosineSimilarity }
