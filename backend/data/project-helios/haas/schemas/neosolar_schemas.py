"""
Schemas para o catálogo de produtos da NeoSolar.
Este módulo define os modelos de dados utilizados para representar produtos,
modelos, categorias e outras entidades relacionadas ao catálogo da NeoSolar.
"""

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel


class EnderecoNeoSolar(BaseModel):
    """Modelo para endereço da empresa NeoSolar."""
    logradouro: str
    bairro: str
    cep: str
    cidade: str
    estado: str
    pais: str


class ContatoNeoSolar(BaseModel):
    """Modelo para informações de contato da empresa NeoSolar."""
    telefone: str
    whatsapp: Optional[str] = None
    sac: Optional[str] = None


class EmpresaNeoSolar(BaseModel):
    """Modelo para informações da empresa NeoSolar."""
    nome: str
    slogan: Optional[str] = None
    website: str
    portalB2B: Optional[str] = None
    contato: ContatoNeoSolar
    endereco: EnderecoNeoSolar
    certificacoes: List[str] = []
    solucoes: List[str] = []


class ModeloNeoSolar(BaseModel):
    """
    Modelo para representar um modelo específico de produto.
    Separado do produto para permitir uma estrutura mais flexível.
    """
    id: Optional[str] = None
    nome: str
    codigo: Optional[str] = None
    descricao: Optional[str] = None
    potencia: Optional[str] = None
    tipo: Optional[str] = None
    linha: Optional[str] = None
    caracteristicas: List[str] = []
    especificacoes: Optional[Dict[str, Any]] = None
    dimensoes: Optional[Dict[str, Union[float, str]]] = None
    garantia: Optional[str] = None
    imagens: List[str] = []
    datasheet_url: Optional[str] = None
    certificacoes: List[str] = []
    preco_sugerido: Optional[float] = None
    disponibilidade: Optional[bool] = None


class SubcategoriaNeoSolar(BaseModel):
    """Modelo para subcategorias de produtos."""
    nome: str
    linha: Optional[str] = None
    descricao: Optional[str] = None
    caracteristicas: List[str] = []
    modelos: List[Union[str, ModeloNeoSolar]] = []


class ProdutoNeoSolar(BaseModel):
    """
    Modelo para representar um produto do catálogo.
    Um produto pode ter vários modelos e subcategorias.
    """
    categoria: str
    descricao: Optional[str] = None
    faixaDePotencia: Optional[str] = None
    garantia: Optional[str] = None
    marcas: List[str] = []
    aplicacoes: List[str] = []
    caracteristicas: List[str] = []
    modelos: List[Union[str, ModeloNeoSolar]] = []
    subcategorias: List[SubcategoriaNeoSolar] = []


class CatalogoNeoSolar(BaseModel):
    """Modelo para o catálogo completo da NeoSolar."""
    empresa: EmpresaNeoSolar
    catalogo: List[ProdutoNeoSolar] = []


class FiltroNeoSolar(BaseModel):
    """Modelo para critérios de filtragem de produtos."""
    categoria: str
    marca: Optional[str] = None
    modelo: Optional[str] = None
    potencia: Optional[str] = None
    linha: Optional[str] = None
    tipo: Optional[str] = None


class ResultadoModelosNeoSolar(BaseModel):
    """Modelo para resultados de busca de modelos."""
    total: int
    modelos: List[ModeloNeoSolar]


class ResultadoProdutosNeoSolar(BaseModel):
    """Modelo para resultados de busca de produtos."""
    total: int
    produtos: List[ProdutoNeoSolar]


class CategoriaInfo(BaseModel):
    """Modelo para informações de uma categoria."""
    id: str
    nome: str
    descricao: Optional[str] = None


class ListaCategorias(BaseModel):
    """Modelo para lista de categorias disponíveis."""
    categorias: List[CategoriaInfo]


class ListaMarcas(BaseModel):
    """Modelo para lista de marcas disponíveis."""
    marcas: List[str]


class ListaModelos(BaseModel):
    """Modelo para lista de modelos disponíveis."""
    modelos: List[str]
