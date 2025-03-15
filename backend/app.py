
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
import json
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database connection handling
# Check if config.py exists, otherwise use environment variables
try:
    from config import DB_CONFIG
    database_config = DB_CONFIG
except ImportError:
    # Use environment variables if config.py doesn't exist
    database_config = {
        'CONNECTION_TYPE': os.environ.get('DB_CONNECTION_TYPE', 'sqlite'),
        'CONNECTION_STRING': os.environ.get('DATABASE_CONNECTION_STRING', ''),
        'SQLITE_PATH': os.environ.get('SQLITE_PATH', 'foot_scan_data.db')
    }

# Determine database connection type
connection_type = database_config.get('CONNECTION_TYPE', 'sqlite').lower()

# Import appropriate database module based on connection type
if connection_type == 'pyodbc':
    try:
        import pyodbc
        def get_db_connection():
            try:
                return pyodbc.connect(database_config.get('CONNECTION_STRING', ''))
            except Exception as e:
                print(f"Error connecting to database with pyodbc: {e}")
                return None
    except ImportError:
        print("Warning: pyodbc module not available. Falling back to SQLite.")
        connection_type = 'sqlite'

elif connection_type == 'pymssql':
    try:
        import pymssql
        def get_db_connection():
            try:
                # Parse connection string or use separate parameters from config
                conn_str = database_config.get('CONNECTION_STRING', '')
                if conn_str:
                    # You would need to parse the connection string here
                    # This is a simplified example
                    return pymssql.connect(conn_str)
                else:
                    # Or use explicit parameters
                    return pymssql.connect(
                        server=database_config.get('SERVER', ''),
                        database=database_config.get('DATABASE', ''),
                        user=database_config.get('USERNAME', ''),
                        password=database_config.get('PASSWORD', '')
                    )
            except Exception as e:
                print(f"Error connecting to database with pymssql: {e}")
                return None
    except ImportError:
        print("Warning: pymssql module not available. Falling back to SQLite.")
        connection_type = 'sqlite'

# SQLite fallback
if connection_type == 'sqlite':
    import sqlite3
    def get_db_connection():
        try:
            sqlite_path = database_config.get('SQLITE_PATH', 'foot_scan_data.db')
            # Create tables if they don't exist (first run)
            conn = sqlite3.connect(sqlite_path)
            create_sqlite_demo_data(conn)
            return conn
        except Exception as e:
            print(f"Error connecting to SQLite database: {e}")
            return None

    def create_sqlite_demo_data(conn):
        """Create demo tables and data for SQLite if they don't exist"""
        cursor = conn.cursor()
        
        # Check if tables exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='scans'")
        if not cursor.fetchone():
            print("Creating demo SQLite database tables...")
            
            # Create tables
            cursor.execute('''
            CREATE TABLE scans (
                id INTEGER PRIMARY KEY,
                scan_date TEXT,
                tenant_id TEXT,
                country_code TEXT,
                age INTEGER,
                gender TEXT,
                foot_length REAL,
                foot_width REAL,
                recommended_size TEXT,
                latitude REAL,
                longitude REAL
            )
            ''')
            
            # Insert demo data
            demo_data = [
                ('2023-01-15', 'TENANT1', 'US', 35, 'M', 270.5, 105.2, 'US 9', 40.7128, -74.0060),
                ('2023-02-20', 'TENANT1', 'US', 42, 'F', 245.8, 95.4, 'US 7.5', 34.0522, -118.2437),
                ('2023-03-10', 'TENANT2', 'UK', 28, 'M', 285.2, 110.8, 'UK 10', 51.5074, -0.1278),
                ('2023-04-05', 'TENANT2', 'DE', 45, 'F', 250.3, 98.1, 'EU 39', 52.5200, 13.4050),
                ('2023-05-12', 'TENANT3', 'JP', 32, 'M', 265.7, 102.3, 'JP 26.5', 35.6762, 139.6503),
                ('2023-06-18', 'TENANT1', 'US', 25, 'F', 240.1, 93.5, 'US 7', 37.7749, -122.4194),
                ('2023-07-22', 'TENANT3', 'CA', 50, 'M', 280.4, 108.7, 'CA 10.5', 43.6532, -79.3832),
                ('2023-08-30', 'TENANT2', 'FR', 38, 'F', 248.9, 97.2, 'EU 38.5', 48.8566, 2.3522),
                ('2023-09-14', 'TENANT1', 'US', 29, 'M', 275.3, 106.5, 'US 9.5', 39.9526, -75.1652),
                ('2023-10-25', 'TENANT3', 'AU', 41, 'F', 252.6, 99.3, 'AU 8', -33.8688, 151.2093),
                ('2023-11-11', 'TENANT2', 'IT', 33, 'M', 272.8, 104.8, 'EU 42', 41.9028, 12.4964),
                ('2023-12-05', 'TENANT1', 'US', 47, 'F', 255.2, 100.5, 'US 8.5', 36.1699, -115.1398)
            ]
            
            for row in demo_data:
                cursor.execute('''
                INSERT INTO scans
                (scan_date, tenant_id, country_code, age, gender, foot_length, foot_width, recommended_size, latitude, longitude)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', row)
            
            conn.commit()
            print("Demo data created successfully!")

# SQL Query Templates based on database type
def get_scan_query():
    if connection_type == 'sqlite':
        return '''
        SELECT 
            scan_date, 
            COUNT(*) as scan_count
        FROM 
            scans
        WHERE 
            scan_date BETWEEN ? AND ?
            AND (? = 'ALL' OR tenant_id = ?)
            AND (? = 'ALL' OR country_code = ?)
            AND age BETWEEN ? AND ?
            AND (? = 'ALL' OR gender = ?)
        GROUP BY 
            scan_date
        ORDER BY 
            scan_date
        '''
    else:
        return '''
        SELECT 
            CONVERT(VARCHAR(10), scan_date, 120) as scan_date, 
            COUNT(*) as scan_count
        FROM 
            scans
        WHERE 
            scan_date BETWEEN ? AND ?
            AND (? = 'ALL' OR tenant_id = ?)
            AND (? = 'ALL' OR country_code = ?)
            AND age BETWEEN ? AND ?
            AND (? = 'ALL' OR gender = ?)
        GROUP BY 
            CONVERT(VARCHAR(10), scan_date, 120)
        ORDER BY 
            scan_date
        '''

def get_recommendation_query():
    if connection_type == 'sqlite':
        return '''
        SELECT 
            recommended_size, 
            COUNT(*) as recommendation_count
        FROM 
            scans
        WHERE 
            scan_date BETWEEN ? AND ?
            AND (? = 'ALL' OR tenant_id = ?)
            AND (? = 'ALL' OR country_code = ?)
            AND age BETWEEN ? AND ?
            AND (? = 'ALL' OR gender = ?)
        GROUP BY 
            recommended_size
        ORDER BY 
            recommendation_count DESC
        '''
    else:
        return '''
        SELECT 
            recommended_size, 
            COUNT(*) as recommendation_count
        FROM 
            scans
        WHERE 
            scan_date BETWEEN ? AND ?
            AND (? = 'ALL' OR tenant_id = ?)
            AND (? = 'ALL' OR country_code = ?)
            AND age BETWEEN ? AND ?
            AND (? = 'ALL' OR gender = ?)
        GROUP BY 
            recommended_size
        ORDER BY 
            recommendation_count DESC
        '''

def get_size_heatmap_query():
    if connection_type == 'sqlite':
        return '''
        SELECT 
            ROUND(foot_length, 5) as length_mm, 
            ROUND(foot_width, 5) as width_mm, 
            COUNT(*) as frequency
        FROM 
            scans
        WHERE 
            scan_date BETWEEN ? AND ?
            AND (? = 'ALL' OR tenant_id = ?)
            AND (? = 'ALL' OR country_code = ?)
            AND age BETWEEN ? AND ?
            AND (? = 'ALL' OR gender = ?)
        GROUP BY 
            ROUND(foot_length, 5), 
            ROUND(foot_width, 5)
        '''
    else:
        return '''
        SELECT 
            ROUND(foot_length, 5) as length_mm, 
            ROUND(foot_width, 5) as width_mm, 
            COUNT(*) as frequency
        FROM 
            scans
        WHERE 
            scan_date BETWEEN ? AND ?
            AND (? = 'ALL' OR tenant_id = ?)
            AND (? = 'ALL' OR country_code = ?)
            AND age BETWEEN ? AND ?
            AND (? = 'ALL' OR gender = ?)
        GROUP BY 
            ROUND(foot_length, 5), 
            ROUND(foot_width, 5)
        '''

# Data Processing Functions
def process_scan_data(rows):
    data = []
    for row in rows:
        # Handle different database return types
        if isinstance(row, tuple):
            data.append({
                "date": row[0],
                "count": row[1]
            })
        else:
            # Some database drivers return dict-like objects
            data.append({
                "date": row.scan_date if hasattr(row, 'scan_date') else row[0],
                "count": row.scan_count if hasattr(row, 'scan_count') else row[1]
            })
    return data

def process_recommendation_data(rows):
    data = []
    for row in rows:
        if isinstance(row, tuple):
            data.append({
                "size": row[0],
                "count": row[1]
            })
        else:
            data.append({
                "size": row.recommended_size if hasattr(row, 'recommended_size') else row[0],
                "count": row.recommendation_count if hasattr(row, 'recommendation_count') else row[1]
            })
    return data

def process_heatmap_data(rows):
    data = []
    for row in rows:
        if isinstance(row, tuple):
            data.append({
                "length": float(row[0]),
                "width": float(row[1]),
                "frequency": int(row[2])
            })
        else:
            data.append({
                "length": float(row.length_mm if hasattr(row, 'length_mm') else row[0]),
                "width": float(row.width_mm if hasattr(row, 'width_mm') else row[1]),
                "frequency": int(row.frequency if hasattr(row, 'frequency') else row[2])
            })
    return data

# API Routes
@app.route('/data', methods=['POST'])
def get_scan_data():
    try:
        filters = request.json
        conn = get_db_connection()
        
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        cursor = conn.cursor()
        query = get_scan_query()
        
        params = (
            filters.get('startDate', '2023-01-01'),
            filters.get('endDate', '2023-12-31'),
            filters.get('tenantId', 'ALL'),
            filters.get('tenantId', 'ALL'),
            filters.get('countryCode', 'ALL'),
            filters.get('countryCode', 'ALL'),
            filters.get('minAge', 0),
            filters.get('maxAge', 99),
            filters.get('gender', 'ALL'),
            filters.get('gender', 'ALL')
        )
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        result = process_scan_data(rows)
        conn.close()
        
        return jsonify(result)
    except Exception as e:
        print(f"Error in /data endpoint: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/recommendation_data', methods=['POST'])
def get_recommendation_data():
    try:
        filters = request.json
        conn = get_db_connection()
        
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        cursor = conn.cursor()
        query = get_recommendation_query()
        
        params = (
            filters.get('startDate', '2023-01-01'),
            filters.get('endDate', '2023-12-31'),
            filters.get('tenantId', 'ALL'),
            filters.get('tenantId', 'ALL'),
            filters.get('countryCode', 'ALL'),
            filters.get('countryCode', 'ALL'),
            filters.get('minAge', 0),
            filters.get('maxAge', 99),
            filters.get('gender', 'ALL'),
            filters.get('gender', 'ALL')
        )
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        result = process_recommendation_data(rows)
        conn.close()
        
        return jsonify(result)
    except Exception as e:
        print(f"Error in /recommendation_data endpoint: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/size_heatmap_data', methods=['POST'])
def get_size_heatmap_data():
    try:
        filters = request.json
        conn = get_db_connection()
        
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        cursor = conn.cursor()
        query = get_size_heatmap_query()
        
        params = (
            filters.get('startDate', '2023-01-01'),
            filters.get('endDate', '2023-12-31'),
            filters.get('tenantId', 'ALL'),
            filters.get('tenantId', 'ALL'),
            filters.get('countryCode', 'ALL'),
            filters.get('countryCode', 'ALL'),
            filters.get('minAge', 0),
            filters.get('maxAge', 99),
            filters.get('gender', 'ALL'),
            filters.get('gender', 'ALL')
        )
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        result = process_heatmap_data(rows)
        conn.close()
        
        return jsonify(result)
    except Exception as e:
        print(f"Error in /size_heatmap_data endpoint: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint to verify the API is running"""
    return jsonify({"status": "ok"})

@app.route('/')
def index():
    """API documentation endpoint"""
    return jsonify({
        "api": "Foot Scanning Analytics API",
        "version": "1.0",
        "endpoints": [
            {"path": "/data", "method": "POST", "description": "Get scan data"},
            {"path": "/recommendation_data", "method": "POST", "description": "Get recommendation data"},
            {"path": "/size_heatmap_data", "method": "POST", "description": "Get size heatmap data"},
            {"path": "/health", "method": "GET", "description": "Health check"}
        ],
        "connection_type": connection_type
    })

if __name__ == '__main__':
    app.run(debug=True)
