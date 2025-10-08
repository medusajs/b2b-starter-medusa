# Pacote de Logos – PNG e SVG

Este pacote contém:
- `logos_manifest.csv`: lista de fabricantes e URLs verificadas para **SVG** e **PNG**.
- `download_logos.sh`: script (bash) para baixar os logos em lote (Linux/macOS/WLS).
- `download_logos.ps1`: script (PowerShell) para baixar os logos em lote (Windows).
- Saída: pasta `logos/<FABRICANTE>/logo.svg` e `logo.png` quando disponíveis.

## Como usar

### macOS / Linux
```bash
cd "$(dirname "$0")"
bash download_logos.sh
```

### Windows (PowerShell)
```powershell
cd $PSScriptRoot
.\download_logos.ps1
```

> Dica: edite `logos_manifest.csv` para incluir/ajustar URLs que você preferir.

## Fontes (exemplos incluídos no manifest)
- **BYD** — SVG oficial no Wikimedia, PNG espelhado: veja a planilha.
- **Trina Solar** — SVG e PNG no Wikimedia.
- **JA Solar** — SVG no Wikimedia.
- **Jinko Solar** — SVG via Worldvectorlogo, PNG via Seeklogo.
- **Huawei** — SVG do artigo da Wikipedia (arquivo padrão).
- **ZTROON** — PNG oficial da página da marca (ativo Wix).

> Observação legal: mesmo que alguns arquivos estejam em domínio público ou sob licenças permissivas, os **logotipos podem ser marcas registradas**.
Verifique as diretrizes de uso de cada marca antes de publicar materiais.

## Atualizando o Manifest
Abra `logos_manifest.csv` e preencha as colunas `svg_url` e `png_url` para os demais fabricantes. 
Você pode rodar os scripts novamente — downloads existentes serão sobrescritos.

_Gerado automaticamente._
