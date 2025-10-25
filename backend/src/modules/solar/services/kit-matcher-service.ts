import { SolarKit } from "../types/common";

export interface KitMatchCriteria {
  kwp_alvo: number;
  kwp_tolerance?: number; // % tolerance
  tipo_sistema?: string;
  budget_max?: number;
}

export class SolarKitMatcherService {
  
  findMatchingKits(
    criteria: KitMatchCriteria,
    availableKits: SolarKit[] = []
  ): SolarKit[] {
    const tolerance = criteria.kwp_tolerance || 15; // 15% default
    const kwp_min = criteria.kwp_alvo * (1 - tolerance / 100);
    const kwp_max = criteria.kwp_alvo * (1 + tolerance / 100);
    
    // Filter kits within power range
    let matches = availableKits.filter(kit => 
      kit.potencia_kwp >= kwp_min && kit.potencia_kwp <= kwp_max
    );
    
    // Filter by budget if specified
    if (criteria.budget_max) {
      matches = matches.filter(kit => kit.preco_brl <= criteria.budget_max!);
    }
    
    // Calculate match scores
    matches = matches.map(kit => ({
      ...kit,
      match_score: this.calculateMatchScore(kit, criteria)
    }));
    
    // Sort by match score (descending)
    matches.sort((a, b) => b.match_score - a.match_score);
    
    // If no matches, return mock kit
    if (matches.length === 0) {
      return [this.createMockKit(criteria.kwp_alvo)];
    }
    
    return matches.slice(0, 3); // Top 3 matches
  }

  private calculateMatchScore(kit: SolarKit, criteria: KitMatchCriteria): number {
    let score = 100;
    
    // Power match (closer to target = higher score)
    const powerDiff = Math.abs(kit.potencia_kwp - criteria.kwp_alvo) / criteria.kwp_alvo;
    score -= powerDiff * 50;
    
    // Availability bonus
    if (kit.disponibilidade.em_estoque) {
      score += 10;
    }
    
    // Price efficiency (lower price per kWp = higher score)
    const pricePerKwp = kit.preco_brl / kit.potencia_kwp;
    if (pricePerKwp < 3500) score += 5; // Below average price
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private createMockKit(kwp_alvo: number): SolarKit {
    const numero_paineis = Math.ceil(kwp_alvo / 0.55);
    const kwp_ajustado = numero_paineis * 0.55;
    
    return {
      kit_id: `MOCK-${kwp_alvo.toFixed(1)}KWP`,
      nome: `Kit Solar ${kwp_ajustado.toFixed(1)}kWp`,
      potencia_kwp: kwp_ajustado,
      match_score: 85,
      preco_brl: kwp_ajustado * 3500,
      componentes: {
        paineis: [{
          marca: "ASTRONERGY",
          modelo: "ASTRO 6 CHEETAH HC 144M",
          potencia_w: 550,
          quantidade: numero_paineis,
        }],
        inversores: [{
          marca: "TSUNESS",
          modelo: "HY-G",
          potencia_kw: Math.ceil(kwp_ajustado * 0.85 * 10) / 10,
          quantidade: 1,
        }],
      },
      disponibilidade: {
        em_estoque: true,
        prazo_entrega_dias: 7,
      },
    };
  }
}

export const solarKitMatcherService = new SolarKitMatcherService();