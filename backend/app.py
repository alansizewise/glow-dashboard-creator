
from flask import Flask, render_template, request, jsonify
import pyodbc
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Check if config.py exists, otherwise use environment variables
try:
    from config import DB_CONFIG
    database_connection_string = DB_CONFIG['DATABASE_CONNECTION_STRING']
except ImportError:
    # Use environment variables if config.py doesn't exist
    database_connection_string = os.environ.get('DATABASE_CONNECTION_STRING')
    if not database_connection_string:
        print("WARNING: No database connection string found. Set DATABASE_CONNECTION_STRING env variable.")
        database_connection_string = ""

# SQL Query Templates 
# ... keep existing code (your SQL queries from the previous message)

def get_db_connection():
    try:
        return pyodbc.connect(database_connection_string)
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

# Data Processing Functions
# ... keep existing code (your data processing functions from the previous message)

# API Routes
@app.route('/data', methods=['POST'])
def get_scan_data():
    # ... keep existing code (scan data endpoint)

@app.route('/recommendation_data', methods=['POST'])
def get_recommendation_data():
    # ... keep existing code (recommendation data endpoint)

@app.route('/size_heatmap_data', methods=['POST'])
def get_size_heatmap_data():
    # ... keep existing code (size heatmap data endpoint)

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint to verify the API is running"""
    return jsonify({"status": "ok"})

# Remove the template routes since we're using React frontend
# We'll keep a simple root route for API documentation
@app.route('/')
def index():
    return jsonify({
        "api": "Foot Scanning Analytics API",
        "version": "1.0",
        "endpoints": [
            {"path": "/data", "method": "POST", "description": "Get scan data"},
            {"path": "/recommendation_data", "method": "POST", "description": "Get recommendation data"},
            {"path": "/size_heatmap_data", "method": "POST", "description": "Get size heatmap data"}
        ]
    })

if __name__ == '__main__':
    app.run(debug=True)
