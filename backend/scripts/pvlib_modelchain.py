#!/usr/bin/env python3
"""
pvlib_modelchain.py - ModelChain Integration for YSH Viability Calculator

Integração do pvlib.modelchain.ModelChain para simulação precisa de sistemas fotovoltaicos.
Recebe configuração via JSON e retorna resultados de geração anual.

Dependencies:
  pip install pvlib pandas numpy

Usage:
  python pvlib_modelchain.py '{"location": {...}, "system": {...}, "losses": {...}}'
"""

import sys
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

try:
    import pvlib
    from pvlib.location import Location
    from pvlib.pvsystem import PVSystem
    from pvlib.modelchain import ModelChain
except ImportError:
    print(json.dumps({
        "error": "pvlib not installed",
        "message": "Please install: pip install pvlib pandas numpy"
    }))
    sys.exit(1)


def simulate_modelchain(config: dict) -> dict:
    """
    Simula geração anual usando pvlib.modelchain.ModelChain
    
    Args:
        config: Configuração do sistema com location, system, losses
    
    Returns:
        Resultado da simulação com geração anual, PR, etc.
    """
    try:
        # 1. Criar Location
        loc_data = config["location"]
        location = Location(
            latitude=loc_data["latitude"],
            longitude=loc_data["longitude"],
            altitude=loc_data.get("altitude", 0),
            tz=loc_data.get("timezone", "America/Sao_Paulo")
        )
        
        # 2. Criar PVSystem
        sys_data = config["system"]
        
        # Converter parâmetros para formato pvlib
        module_params = {
            "pdc0": sys_data["module_parameters"]["V_mp_ref"] * sys_data["module_parameters"]["I_mp_ref"],
            "gamma_pdc": sys_data["module_parameters"]["gamma_pmax"] / 100,  # % para decimal
            **sys_data["module_parameters"]
        }
        
        inverter_params = sys_data["inverter_parameters"]
        
        pv_system = PVSystem(
            surface_tilt=sys_data["surface_tilt"],
            surface_azimuth=sys_data["surface_azimuth"],
            module_parameters=module_params,
            inverter_parameters=inverter_params,
            modules_per_string=sys_data["modules_per_string"],
            strings_per_inverter=sys_data["strings_per_inverter"]
        )
        
        # 3. Criar ModelChain
        mc = ModelChain(
            system=pv_system,
            location=location,
            aoi_model="physical",
            spectral_model="no_loss"
        )
        
        # 4. Buscar dados meteorológicos (TMY - Typical Meteorological Year)
        # Usando PVGIS (European Commission) que tem boa cobertura Brasil
        weather = get_weather_data(location)
        
        # 5. Executar simulação
        mc.run_model(weather)
        
        # 6. Processar resultados
        ac_power = mc.results.ac
        
        # Filtrar valores negativos e NaN
        ac_power = ac_power.clip(lower=0).fillna(0)
        
        # Calcular métricas
        annual_generation_kwh = float(ac_power.sum() / 1000)  # W para kW
        monthly_generation = []
        
        for month in range(1, 13):
            month_data = ac_power[ac_power.index.month == month]
            monthly_kwh = float(month_data.sum() / 1000)
            monthly_generation.append(round(monthly_kwh, 2))
        
        # Performance Ratio
        system_kwp = (sys_data["modules_per_string"] * 
                     sys_data["strings_per_inverter"] * 
                     module_params["pdc0"]) / 1000
        
        # PSH (Peak Sun Hours) - irradiância total anual / 1000
        total_irradiance_kwh_m2 = float(weather["ghi"].sum() / 1000)
        psh_annual = total_irradiance_kwh_m2
        
        theoretical_generation = system_kwp * psh_annual
        performance_ratio = annual_generation_kwh / theoretical_generation if theoretical_generation > 0 else 0.0
        
        # Capacity Factor
        capacity_factor = (annual_generation_kwh / (system_kwp * 8760)) * 100
        
        return {
            "success": True,
            "annual_generation_kwh": round(annual_generation_kwh, 2),
            "monthly_avg_kwh": round(annual_generation_kwh / 12, 2),
            "monthly_generation": monthly_generation,
            "performance_ratio": round(performance_ratio, 3),
            "capacity_factor": round(capacity_factor, 2),
            "pvlib_version": pvlib.__version__,
            "metadata": {
                "system_kwp": round(system_kwp, 2),
                "total_irradiance_kwh_m2": round(total_irradiance_kwh_m2, 2),
                "simulation_hours": len(ac_power)
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__
        }


def get_weather_data(location: Location) -> pd.DataFrame:
    """
    Busca dados meteorológicos TMY para a localização
    
    Primeiro tenta PVGIS, depois fallback para dados sintéticos
    """
    try:
        # Tentar PVGIS (melhor cobertura para Brasil)
        weather = pvlib.iotools.get_pvgis_tmy(
            latitude=location.latitude,
            longitude=location.longitude,
            map_variables=True
        )[0]
        
        # Renomear colunas para padrão pvlib
        weather = weather.rename(columns={
            "temp_air": "temp_air",
            "wind_speed": "wind_speed",
            "ghi": "ghi",
            "dni": "dni",
            "dhi": "dhi"
        })
        
        return weather
        
    except Exception as e:
        print(f"Warning: PVGIS failed ({e}), using synthetic weather data", file=sys.stderr)
        
        # Fallback: gerar dados sintéticos baseados em HSP típico do Brasil
        return generate_synthetic_weather(location)


def generate_synthetic_weather(location: Location) -> pd.DataFrame:
    """
    Gera dados meteorológicos sintéticos para simulação
    Baseado em perfis típicos brasileiros
    """
    # HSP médio por região (aproximação)
    latitude = location.latitude
    
    if latitude < -10:  # Sul
        hsp_avg = 4.7
    elif latitude < -20:  # Sudeste/Centro-Oeste
        hsp_avg = 5.2
    else:  # Norte/Nordeste
        hsp_avg = 5.5
    
    # Criar ano completo (8760 horas)
    start = datetime(2024, 1, 1)
    times = pd.date_range(start, periods=8760, freq="h", tz=location.tz)
    
    weather_data = []
    
    for timestamp in times:
        hour = timestamp.hour
        month = timestamp.month
        
        # Sazonalidade (verão/inverno)
        if month in [12, 1, 2]:  # Verão
            seasonal_factor = 1.15
        elif month in [6, 7, 8]:  # Inverno
            seasonal_factor = 0.85
        else:
            seasonal_factor = 1.0
        
        # Perfil diário de irradiância (curva senoidal)
        if 6 <= hour <= 18:
            # GHI (Global Horizontal Irradiance)
            hour_angle = (hour - 12) * 15  # graus
            ghi = hsp_avg * 1000 * np.cos(np.radians(hour_angle)) ** 2 * seasonal_factor
            ghi = max(0, ghi)
            
            # DNI e DHI (aproximações)
            dni = ghi * 0.8
            dhi = ghi * 0.2
        else:
            ghi = dni = dhi = 0
        
        # Temperatura (variação diária + sazonal)
        temp_base = 25
        temp_seasonal = -5 if month in [6, 7, 8] else 5 if month in [12, 1, 2] else 0
        temp_daily = -3 if hour < 6 or hour > 20 else 3 if 12 <= hour <= 16 else 0
        temp_air = temp_base + temp_seasonal + temp_daily
        
        # Vento (constante aproximado)
        wind_speed = 3.0
        
        weather_data.append({
            "ghi": ghi,
            "dni": dni,
            "dhi": dhi,
            "temp_air": temp_air,
            "wind_speed": wind_speed
        })
    
    df = pd.DataFrame(weather_data, index=times)
    return df


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": "Missing input",
            "usage": "python pvlib_modelchain.py '{\"location\": {...}, \"system\": {...}}'"
        }))
        sys.exit(1)
    
    try:
        config = json.loads(sys.argv[1])
        result = simulate_modelchain(config)
        print(json.dumps(result))
    except json.JSONDecodeError as e:
        print(json.dumps({
            "error": "Invalid JSON input",
            "message": str(e)
        }))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({
            "error": "Unexpected error",
            "message": str(e),
            "type": type(e).__name__
        }))
        sys.exit(1)
