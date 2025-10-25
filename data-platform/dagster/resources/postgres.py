"""
PostgreSQL Resource for Dagster
"""

from dagster import ConfigurableResource
import psycopg2
import pandas as pd
from typing import Optional


class PostgresResource(ConfigurableResource):
    """
    Resource para conectar ao Postgres (Medusa ou Analytics DB).
    """
    
    host: str
    port: int = 5432
    database: str
    user: str
    password: str
    
    def get_connection(self):
        """Retorna conexão psycopg2."""
        return psycopg2.connect(
            host=self.host,
            port=self.port,
            database=self.database,
            user=self.user,
            password=self.password,
        )
    
    def execute_query(self, query: str, params: Optional[tuple] = None) -> pd.DataFrame:
        """Executa query e retorna DataFrame."""
        conn = self.get_connection()
        try:
            df = pd.read_sql_query(query, conn, params=params)
            return df
        finally:
            conn.close()
    
    def execute_command(self, command: str, params: Optional[tuple] = None):
        """Executa comando SQL (INSERT, UPDATE, etc.)."""
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(command, params)
            conn.commit()
        finally:
            cursor.close()
            conn.close()
