# 🧠 Script de Análise e Otimização Inteligente de Imagens de Produtos

"""
Sistema Avançado de Análise e Otimização de Imagens

Este script realiza análise inteligente de cada imagem, diagnostica problemas específicos
e aplica melhorias personalizadas baseadas no tipo de conteúdo detectado.

Funcionalidades:
- Classificação automática de tipo de imagem (produto, diagrama, logo, etc.)
- Detecção de problemas específicos (logos borrados, texto ilegível, etc.)
- Otimização adaptativa preservando detalhes críticos
- Análise de qualidade visual e correções direcionadas
- Relatórios detalhados por imagem
"""

import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
import skimage
from skimage import filters, morphology, measure, color
from skimage.feature import canny
from skimage.measure import label, regionprops
import json
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor, as_completed
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Tuple, Any
import time
from enum import Enum
import warnings
warnings.filterwarnings('ignore')


class ImageType(Enum):
    PRODUCT = "produto"
    DIAGRAM = "diagrama"
    LOGO = "logo"
    TEXT_DOCUMENT = "documento_texto"
    TECHNICAL_DRAWING = "desenho_tecnico"
    PANEL_SOLAR = "painel_solar"
    INVERTER = "inversor"
    STRUCTURE = "estrutura"
    UNKNOWN = "desconhecido"


class QualityIssue(Enum):
    BLURRY = "borrado"
    NOISY = "ruidoso"
    LOW_CONTRAST = "baixo_contraste"
    DARK = "escuro"
    BRIGHT = "claro"
    LOGO_FADED = "logo_desbotado"
    TEXT_UNREADABLE = "texto_ilegivel"
    COLOR_CAST = "dominancia_cor"
    ARTIFACTS = "artefatos"
    NONE = "nenhum"


@dataclass
class ImageAnalysis:
    """Resultado da análise inteligente da imagem"""
    image_type: ImageType
    quality_score: float  # 0-100
    issues: List[QualityIssue]
    has_text: bool
    has_logos: bool
    text_regions: List[Dict]
    logo_regions: List[Dict]
    dominant_colors: List[Tuple[int, int, int]]
    brightness: float
    contrast: float
    sharpness: float
    noise_level: float
    resolution_score: float
    composition_score: float


@dataclass
class OptimizationConfig:
    """Configuração de otimização adaptativa"""
    denoise_strength: float
    sharpen_amount: float
    contrast_boost: float
    brightness_adjust: float
    color_enhancement: float
    upscale_factor: float
    preserve_regions: List[Dict]  # regiões críticas para preservar
    target_format: str
    quality_preset: str


@dataclass
class ProcessingResult:
    """Resultado do processamento"""
    input_path: str
    output_path: str
    success: bool
    original_size_bytes: int
    optimized_size_bytes: int
    compression_ratio: float
    processing_time_ms: float
    width: int
    height: int
    format: str
    analysis: ImageAnalysis
    optimizations_applied: List[str]
    error: Optional[str] = None


class IntelligentImageAnalyzer:
    """Analisador inteligente de imagens"""

    def __init__(self):
        self.min_text_area = 100
        self.min_logo_area = 500
        self.blur_threshold = 100
        self.contrast_threshold = 0.3

    def analyze_image(self, image: np.ndarray, filename: str) -> ImageAnalysis:
        """Realiza análise completa da imagem"""
        try:
            # Classificação do tipo de imagem
            image_type = self._classify_image_type(image, filename)

            # Análise de qualidade
            quality_metrics = self._analyze_quality(image)

            # Detecção de texto e logos
            text_regions = self._detect_text_regions(image)
            logo_regions = self._detect_logo_regions(image)

            # Análise de cores
            dominant_colors = self._extract_dominant_colors(image)

            # Diagnóstico de problemas
            issues = self._diagnose_issues(image, quality_metrics, text_regions, logo_regions)

            # Pontuação geral de qualidade
            quality_score = self._calculate_quality_score(quality_metrics, issues)

            return ImageAnalysis(
                image_type=image_type,
                quality_score=quality_score,
                issues=issues,
                has_text=len(text_regions) > 0,
                has_logos=len(logo_regions) > 0,
                text_regions=text_regions,
                logo_regions=logo_regions,
                dominant_colors=dominant_colors,
                brightness=quality_metrics['brightness'],
                contrast=quality_metrics['contrast'],
                sharpness=quality_metrics['sharpness'],
                noise_level=quality_metrics['noise'],
                resolution_score=quality_metrics['resolution'],
                composition_score=quality_metrics['composition']
            )

        except Exception as e:
            print(f"❌ Erro na análise: {e}")
            return self._create_fallback_analysis()

    def _classify_image_type(self, image: np.ndarray, filename: str) -> ImageType:
        """Classifica o tipo de imagem baseado em características"""
        filename_lower = filename.lower()

        # Classificação por nome do arquivo
        if 'painel' in filename_lower or 'panel' in filename_lower:
            return ImageType.PANEL_SOLAR
        elif 'inversor' in filename_lower or 'inverter' in filename_lower:
            return ImageType.INVERTER
        elif 'estrutura' in filename_lower or 'structure' in filename_lower:
            return ImageType.STRUCTURE
        elif 'logo' in filename_lower:
            return ImageType.LOGO
        elif 'diagrama' in filename_lower or 'diagram' in filename_lower:
            return ImageType.DIAGRAM
        elif 'desenho' in filename_lower or 'drawing' in filename_lower:
            return ImageType.TECHNICAL_DRAWING

        # Classificação por análise visual
        height, width = image.shape[:2]
        aspect_ratio = width / height

        # Análise de bordas (diagramas têm muitas linhas retas)
        edges = canny(color.rgb2gray(image))
        edge_density = np.sum(edges) / (height * width)

        # Análise de cores (logos tendem a ter fundo simples)
        unique_colors = len(np.unique(image.reshape(-1, image.shape[2]), axis=0))

        # Análise de texto
        text_regions = self._detect_text_regions(image)

        # Regras de decisão
        if edge_density > 0.05 and aspect_ratio > 1.5:
            return ImageType.TECHNICAL_DRAWING
        elif len(text_regions) > 5:
            return ImageType.TEXT_DOCUMENT
        elif unique_colors < 50 and aspect_ratio < 1.2:
            return ImageType.LOGO
        elif edge_density > 0.02:
            return ImageType.DIAGRAM
        else:
            return ImageType.PRODUCT

    def _analyze_quality(self, image: np.ndarray) -> Dict[str, float]:
        """Analisa métricas de qualidade da imagem"""
        # Converter para grayscale para algumas análises
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

        # Brilho (média dos pixels)
        brightness = np.mean(gray) / 255.0

        # Contraste (desvio padrão normalizado)
        contrast = np.std(gray) / 128.0

        # Nitidez (usando Laplacian variance)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        sharpness = min(laplacian_var / 500.0, 1.0)  # Normalizar

        # Ruído (usando filtro de mediana)
        median_filtered = cv2.medianBlur(gray, 3)
        noise = np.mean(np.abs(gray.astype(float) - median_filtered.astype(float))) / 255.0

        # Resolução (baseada em tamanho e nitidez)
        height, width = image.shape[:2]
        resolution_score = min((width * height) / 1000000.0, 1.0) * sharpness

        # Composição (equilíbrio visual básico)
        composition_score = self._analyze_composition(image)

        return {
            'brightness': brightness,
            'contrast': contrast,
            'sharpness': sharpness,
            'noise': noise,
            'resolution': resolution_score,
            'composition': composition_score
        }

    def _analyze_composition(self, image: np.ndarray) -> float:
        """Analisa a composição visual da imagem"""
        height, width = image.shape[:2]

        # Regra dos terços básica
        third_h, third_w = height // 3, width // 3
        center_region = image[third_h:2*third_h, third_w:2*third_w]
        center_brightness = np.mean(cv2.cvtColor(center_region, cv2.COLOR_RGB2GRAY))

        # Equilíbrio de cores
        color_balance = np.std(image.reshape(-1, 3), axis=0).mean() / 128.0

        return min((center_brightness / 255.0 + color_balance) / 2.0, 1.0)

    def _detect_text_regions(self, image: np.ndarray) -> List[Dict]:
        """Detecta regiões de texto na imagem"""
        # Converter para grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

        # Aplicar threshold adaptativo
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2
        )

        # Operações morfológicas para conectar componentes de texto
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        dilated = cv2.dilate(thresh, kernel, iterations=2)

        # Encontrar contornos
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        text_regions = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > self.min_text_area:
                x, y, w, h = cv2.boundingRect(contour)
                aspect_ratio = w / float(h)

                # Filtro para regiões que parecem texto (retangulares alongadas)
                if 0.1 < aspect_ratio < 10 and w > 10 and h > 5:
                    text_regions.append({
                        'x': x, 'y': y, 'width': w, 'height': h,
                        'area': area, 'aspect_ratio': aspect_ratio
                    })

        return text_regions

    def _detect_logo_regions(self, image: np.ndarray) -> List[Dict]:
        """Detecta regiões que podem conter logos"""
        # Usar detecção de bordas para encontrar formas distintas
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 50, 150)

        # Dilatar para conectar componentes
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
        dilated = cv2.dilate(edges, kernel, iterations=2)

        # Encontrar contornos
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        logo_regions = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > self.min_logo_area:
                x, y, w, h = cv2.boundingRect(contour)
                aspect_ratio = w / float(h)

                # Logos tendem a ser quadrados ou ligeiramente retangulares
                if 0.3 < aspect_ratio < 3.0:
                    # Verificar se tem cores distintas (não é apenas texto)
                    roi = image[y:y+h, x:x+w]
                    if roi.size > 0:
                        unique_colors = len(np.unique(roi.reshape(-1, 3), axis=0))
                        if unique_colors > 20:  # Tem variedade de cores
                            logo_regions.append({
                                'x': x, 'y': y, 'width': w, 'height': h,
                                'area': area, 'aspect_ratio': aspect_ratio,
                                'color_variety': unique_colors
                            })

        return logo_regions

    def _extract_dominant_colors(self, image: np.ndarray, k: int = 5) -> List[Tuple[int, int, int]]:
        """Extrai cores dominantes da imagem"""
        # Redimensionar para acelerar processamento
        small = cv2.resize(image, (100, 100))
        pixels = small.reshape(-1, 3)

        # Usar k-means simples para encontrar cores dominantes
        from sklearn.cluster import KMeans
        kmeans = KMeans(n_clusters=k, n_init=10, random_state=42)
        kmeans.fit(pixels)

        colors = []
        for center in kmeans.cluster_centers_:
            colors.append((int(center[0]), int(center[1]), int(center[2])))

        return colors

    def _diagnose_issues(self, image: np.ndarray, metrics: Dict, text_regions: List,
                        logo_regions: List) -> List[QualityIssue]:
        """Diagnostica problemas específicos da imagem"""
        issues = []

        # Problemas de nitidez
        if metrics['sharpness'] < 0.3:
            issues.append(QualityIssue.BLURRY)

        # Problemas de ruído
        if metrics['noise'] > 0.1:
            issues.append(QualityIssue.NOISY)

        # Problemas de contraste
        if metrics['contrast'] < self.contrast_threshold:
            issues.append(QualityIssue.LOW_CONTRAST)

        # Problemas de brilho
        if metrics['brightness'] < 0.3:
            issues.append(QualityIssue.DARK)
        elif metrics['brightness'] > 0.8:
            issues.append(QualityIssue.BRIGHT)

        # Problemas específicos de logos
        if logo_regions and metrics['contrast'] < 0.4:
            issues.append(QualityIssue.LOGO_FADED)

        # Problemas de texto
        if text_regions and (metrics['sharpness'] < 0.4 or metrics['contrast'] < 0.4):
            issues.append(QualityIssue.TEXT_UNREADABLE)

        # Verificar dominância de cor (color cast)
        if len(metrics.get('dominant_colors', [])) > 0:
            # Calcular desvio da neutralidade
            color_cast = self._detect_color_cast(image)
            if color_cast > 0.2:
                issues.append(QualityIssue.COLOR_CAST)

        return issues if issues else [QualityIssue.NONE]

    def _detect_color_cast(self, image: np.ndarray) -> float:
        """Detecta dominância de cor (color cast)"""
        # Converter para LAB para melhor análise de cor
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)

        # Calcular média dos canais a e b (devem ser próximos de 0 para neutro)
        mean_a = np.mean(a) - 128
        mean_b = np.mean(b) - 128

        color_cast = np.sqrt(mean_a**2 + mean_b**2) / 128.0
        return color_cast

    def _calculate_quality_score(self, metrics: Dict, issues: List[QualityIssue]) -> float:
        """Calcula pontuação geral de qualidade"""
        base_score = (
            metrics['sharpness'] * 0.3 +
            metrics['contrast'] * 0.25 +
            (1.0 - metrics['noise']) * 0.2 +
            metrics['brightness'] * 0.15 +
            metrics['resolution'] * 0.1
        ) * 100

        # Penalizar por problemas
        penalty = len([i for i in issues if i != QualityIssue.NONE]) * 10
        final_score = max(0, min(100, base_score - penalty))

        return final_score

    def _create_fallback_analysis(self) -> ImageAnalysis:
        """Cria análise básica em caso de erro"""
        return ImageAnalysis(
            image_type=ImageType.UNKNOWN,
            quality_score=50.0,
            issues=[QualityIssue.NONE],
            has_text=False,
            has_logos=False,
            text_regions=[],
            logo_regions=[],
            dominant_colors=[],
            brightness=0.5,
            contrast=0.5,
            sharpness=0.5,
            noise_level=0.1,
            resolution_score=0.5,
            composition_score=0.5
        )


class AdaptiveImageOptimizer:
    """Otimizador adaptativo de imagens"""

    def __init__(self):
        self.analyzer = IntelligentImageAnalyzer()

    def create_optimization_config(self, analysis: ImageAnalysis) -> OptimizationConfig:
        """Cria configuração de otimização baseada na análise"""

        # Configurações base por tipo de imagem
        configs = {
            ImageType.PRODUCT: {
                'denoise_strength': 8,
                'sharpen_amount': 1.5,
                'contrast_boost': 1.1,
                'brightness_adjust': 1.0,
                'color_enhancement': 1.15,
                'upscale_factor': 1.0
            },
            ImageType.LOGO: {
                'denoise_strength': 3,  # Muito suave para preservar detalhes
                'sharpen_amount': 2.0,  # Muito sharpening para logos
                'contrast_boost': 1.3,  # Alto contraste para visibilidade
                'brightness_adjust': 1.0,
                'color_enhancement': 1.1,
                'upscale_factor': 1.0
            },
            ImageType.TEXT_DOCUMENT: {
                'denoise_strength': 5,
                'sharpen_amount': 1.8,  # Foco em legibilidade
                'contrast_boost': 1.4,  # Máximo contraste para texto
                'brightness_adjust': 1.0,
                'color_enhancement': 1.0,  # Não alterar cores em documentos
                'upscale_factor': 1.0
            },
            ImageType.TECHNICAL_DRAWING: {
                'denoise_strength': 2,  # Mínimo para preservar linhas
                'sharpen_amount': 1.2,
                'contrast_boost': 1.5,  # Alto contraste para linhas
                'brightness_adjust': 1.0,
                'color_enhancement': 1.0,
                'upscale_factor': 1.0
            },
            ImageType.PANEL_SOLAR: {
                'denoise_strength': 6,
                'sharpen_amount': 1.3,
                'contrast_boost': 1.2,
                'brightness_adjust': 1.05,  # Levemente mais claro
                'color_enhancement': 1.2,
                'upscale_factor': 1.0
            },
            ImageType.INVERTER: {
                'denoise_strength': 7,
                'sharpen_amount': 1.4,
                'contrast_boost': 1.15,
                'brightness_adjust': 1.0,
                'color_enhancement': 1.1,
                'upscale_factor': 1.0
            },
            ImageType.STRUCTURE: {
                'denoise_strength': 8,
                'sharpen_amount': 1.2,
                'contrast_boost': 1.1,
                'brightness_adjust': 1.02,
                'color_enhancement': 1.1,
                'upscale_factor': 1.0
            }
        }

        base_config = configs.get(analysis.image_type, configs[ImageType.PRODUCT])

        # Ajustes baseados nos problemas detectados
        if QualityIssue.BLURRY in analysis.issues:
            base_config['sharpen_amount'] *= 1.5
            base_config['denoise_strength'] *= 0.7  # Menos denoise se borrado

        if QualityIssue.NOISY in analysis.issues:
            base_config['denoise_strength'] *= 1.5

        if QualityIssue.LOW_CONTRAST in analysis.issues:
            base_config['contrast_boost'] *= 1.3

        if QualityIssue.DARK in analysis.issues:
            base_config['brightness_adjust'] *= 1.2

        if QualityIssue.LOGO_FADED in analysis.issues:
            base_config['contrast_boost'] *= 1.4
            base_config['sharpen_amount'] *= 1.3

        if QualityIssue.TEXT_UNREADABLE in analysis.issues:
            base_config['sharpen_amount'] *= 1.4
            base_config['contrast_boost'] *= 1.3
            base_config['denoise_strength'] *= 0.8

        # Regiões críticas para preservar
        preserve_regions = []
        if analysis.has_logos:
            preserve_regions.extend(analysis.logo_regions)
        if analysis.has_text:
            preserve_regions.extend(analysis.text_regions)

        return OptimizationConfig(
            denoise_strength=min(base_config['denoise_strength'], 15),
            sharpen_amount=min(base_config['sharpen_amount'], 3.0),
            contrast_boost=min(base_config['contrast_boost'], 2.0),
            brightness_adjust=min(base_config['brightness_adjust'], 1.5),
            color_enhancement=min(base_config['color_enhancement'], 1.5),
            upscale_factor=base_config['upscale_factor'],
            preserve_regions=preserve_regions,
            target_format='webp',
            quality_preset='adaptive'
        )

    def optimize_image(self, image: np.ndarray, config: OptimizationConfig) -> np.ndarray:
        """Aplica otimizações adaptativas"""
        optimizations_applied = []

        # 1. Correção de brilho se necessário
        if config.brightness_adjust != 1.0:
            image = self._adjust_brightness(image, config.brightness_adjust)
            optimizations_applied.append(f"brightness_{config.brightness_adjust:.2f}")

        # 2. Redução de ruído adaptativa
        if config.denoise_strength > 0:
            image = self._adaptive_denoise(image, config.denoise_strength)
            optimizations_applied.append(f"denoise_{config.denoise_strength:.1f}")

        # 3. Upscaling se necessário
        if config.upscale_factor > 1.0:
            image = self._upscale_image(image, config.upscale_factor)
            optimizations_applied.append(f"upscale_{config.upscale_factor:.1f}x")

        # 4. Melhoria de contraste
        if config.contrast_boost > 1.0:
            image = self._enhance_contrast_adaptive(image, config.contrast_boost)
            optimizations_applied.append(f"contrast_{config.contrast_boost:.2f}")

        # 5. Realce de cores
        if config.color_enhancement > 1.0:
            image = self._enhance_colors(image, config.color_enhancement)
            optimizations_applied.append(f"colors_{config.color_enhancement:.2f}")

        # 6. Sharpening adaptativo
        if config.sharpen_amount > 0:
            image = self._adaptive_sharpen(image, config.sharpen_amount, config.preserve_regions)
            optimizations_applied.append(f"sharpen_{config.sharpen_amount:.2f}")

        return image, optimizations_applied

    def _adjust_brightness(self, image: np.ndarray, factor: float) -> np.ndarray:
        """Ajusta brilho da imagem"""
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV).astype(np.float32)
        hsv[:, :, 2] = np.clip(hsv[:, :, 2] * factor, 0, 255)
        return cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB)

    def _adaptive_denoise(self, image: np.ndarray, strength: float) -> np.ndarray:
        """Redução de ruído adaptativa"""
        # Usar Non-local Means Denoising com força adaptativa
        strength_int = max(1, int(strength))
        return cv2.fastNlMeansDenoisingColored(
            image, None, h=strength_int, hColor=strength_int,
            templateWindowSize=7, searchWindowSize=21
        )

    def _upscale_image(self, image: np.ndarray, factor: float) -> np.ndarray:
        """Upscale da imagem"""
        height, width = image.shape[:2]
        new_width, new_height = int(width * factor), int(height * factor)
        return cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_LANCZOS4)

    def _enhance_contrast_adaptive(self, image: np.ndarray, boost: float) -> np.ndarray:
        """Melhoria adaptativa de contraste usando CLAHE"""
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)

        # Aplicar CLAHE no canal L
        clahe = cv2.createCLAHE(clipLimit=boost, tileGridSize=(8, 8))
        l_enhanced = clahe.apply(l)

        # Boost adicional se necessário
        if boost > 1.2:
            l_enhanced = cv2.convertScaleAbs(l_enhanced, alpha=boost, beta=0)

        enhanced_lab = cv2.merge([l_enhanced, a, b])
        return cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2RGB)

    def _enhance_colors(self, image: np.ndarray, enhancement: float) -> np.ndarray:
        """Realce de cores"""
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV).astype(np.float32)
        hsv[:, :, 1] = np.clip(hsv[:, :, 1] * enhancement, 0, 255)
        return cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB)

    def _adaptive_sharpen(self, image: np.ndarray, amount: float,
                         preserve_regions: List[Dict]) -> np.ndarray:
        """Sharpening adaptativo que preserva regiões críticas"""
        # Aplicar unsharp mask básico
        gaussian = cv2.GaussianBlur(image, (0, 0), 2.0)
        sharpened = cv2.addWeighted(image, 1.0 + amount, gaussian, -amount, 0)

        # Se há regiões para preservar, aplicar sharpening mais suave nelas
        if preserve_regions:
            mask = np.zeros(image.shape[:2], dtype=np.uint8)
            for region in preserve_regions:
                x, y, w, h = region['x'], region['y'], region['width'], region['height']
                cv2.rectangle(mask, (x, y), (x+w, y+h), 255, -1)

            # Aplicar sharpening mais suave nas regiões críticas
            gentle_sharpen = cv2.addWeighted(image, 1.0 + amount*0.5, gaussian, -amount*0.5, 0)

            # Combinar usando máscara
            sharpened = np.where(mask[:, :, np.newaxis] > 0, gentle_sharpen, sharpened)

        return sharpened


def load_image_unicode(image_path: str) -> Optional[np.ndarray]:
    """Carrega imagem suportando Unicode no Windows"""
    try:
        with open(image_path, 'rb') as f:
            file_bytes = np.asarray(bytearray(f.read()), dtype=np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        if img is None:
            return None
        return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    except Exception as e:
        print(f"❌ Erro ao carregar {image_path}: {e}")
        return None


def save_optimized_image(image: np.ndarray, output_path: str, format_type: str,
                        quality: int = 85) -> bool:
    """Salva imagem otimizada"""
    try:
        pil_image = Image.fromarray(image)

        if format_type.lower() == 'webp':
            pil_image.save(output_path, 'WebP', quality=quality, lossless=False)
        elif format_type.lower() == 'jpeg' or format_type.lower() == 'jpg':
            pil_image.save(output_path, 'JPEG', quality=quality, optimize=True)
        elif format_type.lower() == 'png':
            pil_image.save(output_path, 'PNG', optimize=True)
        else:
            pil_image.save(output_path, format_type.upper())

        return True
    except Exception as e:
        print(f"❌ Erro ao salvar {output_path}: {e}")
        return False


def process_single_image(input_path: str, output_dir: str, analyzer: IntelligentImageAnalyzer,
                        optimizer: AdaptiveImageOptimizer) -> ProcessingResult:
    """Processa uma única imagem com análise inteligente"""
    start_time = time.time()

    try:
        # Carregar imagem
        image = load_image_unicode(input_path)
        if image is None:
            return ProcessingResult(
                input_path=input_path,
                output_path="",
                success=False,
                original_size_bytes=0,
                optimized_size_bytes=0,
                compression_ratio=0,
                processing_time_ms=(time.time() - start_time) * 1000,
                width=0,
                height=0,
                format="",
                analysis=analyzer._create_fallback_analysis(),
                optimizations_applied=[],
                error="Falha ao carregar imagem"
            )

        # Análise inteligente
        analysis = analyzer.analyze_image(image, Path(input_path).name)

        # Criar configuração adaptativa
        config = optimizer.create_optimization_config(analysis)

        # Aplicar otimizações
        optimized_image, optimizations = optimizer.optimize_image(image, config)

        # Preparar caminho de saída
        input_name = Path(input_path).stem
        output_path = str(Path(output_dir) / f"{input_name}.{config.target_format}")

        # Salvar imagem otimizada
        success = save_optimized_image(optimized_image, output_path, config.target_format)

        if success:
            # Calcular estatísticas
            original_size = Path(input_path).stat().st_size
            optimized_size = Path(output_path).stat().st_size
            compression_ratio = (1 - optimized_size / original_size) * 100

            return ProcessingResult(
                input_path=input_path,
                output_path=output_path,
                success=True,
                original_size_bytes=original_size,
                optimized_size_bytes=optimized_size,
                compression_ratio=compression_ratio,
                processing_time_ms=(time.time() - start_time) * 1000,
                width=optimized_image.shape[1],
                height=optimized_image.shape[0],
                format=config.target_format,
                analysis=analysis,
                optimizations_applied=optimizations
            )
        else:
            return ProcessingResult(
                input_path=input_path,
                output_path="",
                success=False,
                original_size_bytes=Path(input_path).stat().st_size,
                optimized_size_bytes=0,
                compression_ratio=0,
                processing_time_ms=(time.time() - start_time) * 1000,
                width=image.shape[1],
                height=image.shape[0],
                format="",
                analysis=analysis,
                optimizations_applied=[],
                error="Falha ao salvar imagem"
            )

    except Exception as e:
        return ProcessingResult(
            input_path=input_path,
            output_path="",
            success=False,
            original_size_bytes=0,
            optimized_size_bytes=0,
            compression_ratio=0,
            processing_time_ms=(time.time() - start_time) * 1000,
            width=0,
            height=0,
            format="",
            analysis=analyzer._create_fallback_analysis(),
            optimizations_applied=[],
            error=str(e)
        )


def generate_comprehensive_report(results: List[ProcessingResult], output_dir: str):
    """Gera relatório abrangente do processamento"""
    successful = [r for r in results if r.success]
    failed = [r for r in results if not r.success]

    # Estatísticas gerais
    total_original = sum(r.original_size_bytes for r in successful)
    total_optimized = sum(r.optimized_size_bytes for r in successful)
    total_savings = total_original - total_optimized
    avg_compression = total_savings / total_original * 100 if total_original > 0 else 0

    # Calcular médias para o resumo
    avg_quality_score = sum(r.analysis.quality_score for r in successful) / len(successful) if successful else 0
    avg_width = sum(r.width for r in successful) / len(successful) if successful else 0
    avg_height = sum(r.height for r in successful) / len(successful) if successful else 0
    avg_processing_time = sum(r.processing_time_ms for r in successful) / len(successful) if successful else 0

    # Análise por tipo de imagem
    type_stats = {}
    for result in successful:
        img_type = result.analysis.image_type.value
        if img_type not in type_stats:
            type_stats[img_type] = {
                'count': 0,
                'total_original': 0,
                'total_optimized': 0,
                'avg_quality_before': 0,
                'avg_quality_after': 0,
                'common_issues': []
            }

        type_stats[img_type]['count'] += 1
        type_stats[img_type]['total_original'] += result.original_size_bytes
        type_stats[img_type]['total_optimized'] += result.optimized_size_bytes

        # Coletar problemas comuns
        for issue in result.analysis.issues:
            if issue.value not in type_stats[img_type]['common_issues']:
                type_stats[img_type]['common_issues'].append(issue.value)

    # Relatório detalhado
    report = {
        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
        'summary': {
            'total_images': len(results),
            'successful': len(successful),
            'failed': len(failed),
            'success_rate': len(successful) / len(results) * 100 if results else 0,
            'total_original_size_mb': total_original / 1024 / 1024,
            'total_optimized_size_mb': total_optimized / 1024 / 1024,
            'total_space_saved_mb': total_savings / 1024 / 1024,
            'avg_quality_score': avg_quality_score,
            'avg_compression_ratio': avg_compression,
            'avg_processing_time': avg_processing_time,
            'avg_width': avg_width,
            'avg_height': avg_height,
            'average_compression_percent': avg_compression,
            'average_processing_time_ms': avg_processing_time
        },
        'by_image_type': type_stats,
        'failed_images': [{'path': r.input_path, 'error': r.error} for r in failed],
        'detailed_results': [
            {
                'input_path': r.input_path,
                'output_path': r.output_path,
                'success': r.success,
                'compression_ratio': r.compression_ratio,
                'processing_time_ms': r.processing_time_ms,
                'image_type': r.analysis.image_type.value,
                'quality_score': r.analysis.quality_score,
                'issues_detected': [i.value for i in r.analysis.issues],
                'optimizations_applied': r.optimizations_applied,
                'has_text': r.analysis.has_text,
                'has_logos': r.analysis.has_logos,
                'width': r.width,
                'height': r.height
            } for r in results
        ]
    }

    # Salvar relatório
    report_path = Path(output_dir) / 'intelligent-optimization-report.json'
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    return report


def main():
    """Função principal"""
    import argparse

    parser = argparse.ArgumentParser(
        description='🧠 Otimização Inteligente de Imagens de Produtos',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos de uso:

# Processamento básico
python intelligent-image-optimizer.py --input imagens/ --output otimizadas/

# Com mais workers para processamento paralelo
python intelligent-image-optimizer.py --input imagens/ --output otimizadas/ --workers 8

# Dry-run para análise sem processamento
python intelligent-image-optimizer.py --input imagens/ --output otimizadas/ --dry-run

# Formato específico
python intelligent-image-optimizer.py --input imagens/ --output otimizadas/ --format webp
        """
    )

    parser.add_argument('--input', '-i', required=True,
                       help='Diretório de entrada com imagens')
    parser.add_argument('--output', '-o', required=True,
                       help='Diretório de saída para imagens otimizadas')
    parser.add_argument('--workers', '-w', type=int, default=4,
                       help='Número de workers paralelos (padrão: 4)')
    parser.add_argument('--format', '-f', choices=['webp', 'jpg', 'png'],
                       default='webp', help='Formato de saída (padrão: webp)')
    parser.add_argument('--dry-run', action='store_true',
                       help='Apenas analisar, não processar imagens')

    args = parser.parse_args()

    # Verificar se sklearn está disponível
    try:
        import sklearn
    except ImportError:
        print("❌ sklearn não encontrado. Instale com: pip install scikit-learn")
        return

    # Criar diretórios
    input_dir = Path(args.input)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Encontrar imagens
    image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}
    image_paths = []

    for ext in image_extensions:
        image_paths.extend(input_dir.rglob(f'*{ext}'))
        image_paths.extend(input_dir.rglob(f'*{ext.upper()}'))

    image_paths = list(set(image_paths))  # Remover duplicatas

    if not image_paths:
        print(f"❌ Nenhuma imagem encontrada em {input_dir}")
        return

    print(f"🔍 Encontradas {len(image_paths)} imagens em {input_dir}")
    print(f"📊 Modo: {'ANÁLISE (dry-run)' if args.dry_run else 'PROCESSAMENTO COMPLETO'}")
    print(f"⚙️  Workers: {args.workers}")
    print(f"📦 Formato: {args.format}")
    print()

    # Inicializar analisador e otimizador
    analyzer = IntelligentImageAnalyzer()
    optimizer = AdaptiveImageOptimizer()

    results = []

    if args.dry_run:
        # Apenas análise
        print("🔬 REALIZANDO ANÁLISE INTELIGENTE...")
        print("=" * 80)

        for i, path in enumerate(image_paths, 1):
            print(f"📋 Analisando {i}/{len(image_paths)}: {path.name}")

            image = load_image_unicode(str(path))
            if image is not None:
                analysis = analyzer.analyze_image(image, path.name)
                result = ProcessingResult(
                    input_path=str(path),
                    output_path="",
                    success=True,
                    original_size_bytes=path.stat().st_size,
                    optimized_size_bytes=0,
                    compression_ratio=0,
                    processing_time_ms=0,
                    width=image.shape[1],
                    height=image.shape[0],
                    format="",
                    analysis=analysis,
                    optimizations_applied=[]
                )
                results.append(result)

                # Mostrar resumo da análise
                print(f"   📊 Tipo: {analysis.image_type.value}")
                print(f"   📊 Score: {analysis.quality_score:.1f}")
                print(f"   🔍 Problemas: {', '.join([i.value for i in analysis.issues])}")
                print(f"   📝 Texto: {'Sim' if analysis.has_text else 'Não'}")
                print(f"   🏷️  Logos: {'Sim' if analysis.has_logos else 'Não'}")
                print()

    else:
        # Processamento completo
        print("🚀 INICIANDO PROCESSAMENTO INTELIGENTE...")
        print("=" * 80)

        with ProcessPoolExecutor(max_workers=args.workers) as executor:
            futures = {
                executor.submit(process_single_image, str(path), str(output_dir),
                              analyzer, optimizer): path
                for path in image_paths
            }

            for i, future in enumerate(as_completed(futures), 1):
                path = futures[future]
                result = future.result()
                results.append(result)

                status = "✅" if result.success else "❌"
                print(f"{i:2d}/{len(image_paths):2d} {status} {path.name} - {result.compression_ratio:.1f}% "
                      f"⏱️  {result.processing_time_ms:.0f}ms")

                if result.success:
                    print(f"   📊 Score: {result.analysis.quality_score:.1f} - "
                          f"📊 Tipo: {result.analysis.image_type.value}")
                    print(f"   🔧 Otimizações: {', '.join(result.optimizations_applied)}")
                else:
                    print(f"   ❌ Erro: {result.error}")

                print()

    # Gerar relatório final
    print("📄 GERANDO RELATÓRIO FINAL...")
    report = generate_comprehensive_report(results, str(output_dir))

    # Mostrar resumo
    print("\n" + "=" * 80)
    print("📊 RELATÓRIO FINAL DE OTIMIZAÇÃO INTELIGENTE")
    print("=" * 80)

    summary = report['summary']
    print(f"✅ Sucesso: {summary['successful']}/{summary['total_images']} imagens")
    print(f"📊 Score médio: {summary['avg_quality_score']:.1f}")
    print(f"💾 Economia média: {summary['avg_compression_ratio']:.2f}%")
    print(f"⏱️  Tempo médio: {summary['avg_processing_time']:.2f}ms")
    print(f"📏 Resolução média: {summary['avg_width']:.1f}x{summary['avg_height']:.1f}")
    print(f"💾 Economia total: {summary['total_space_saved_mb']:.0f}MB")
    print(f"📄 Relatório salvo em: {output_dir}/intelligent-optimization-report.json")

    # Estatísticas por tipo
    if report['by_image_type']:
        print("\n📈 ESTATÍSTICAS POR TIPO DE IMAGEM:")
        for img_type, stats in report['by_image_type'].items():
            savings = (stats['total_original'] - stats['total_optimized']) / stats['total_original'] * 100
            print(f"  {img_type}: {stats['count']:2d} imagens - 💾 Economia: {savings:.1f}%")

    if summary['failed'] > 0:
        print(f"\n❌ {summary['failed']} imagens falharam. Verifique o relatório para detalhes.")


if __name__ == '__main__':
    main()