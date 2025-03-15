
# Foot Scanning Analytics Dashboard

## Project Overview
This is a dashboard application for visualizing foot scanning analytics data. It provides:
- Scan activity visualization and mapping
- Recommendation tracking and analysis
- Size heatmap visualization with demographic breakdowns

## Technical Stack
- **Frontend**: React, TypeScript, Recharts, shadcn/ui, Tailwind CSS
- **Backend**: Flask with database support for SQL Server (via pyodbc or pymssql) and SQLite (default)

## Installation and Setup

### Frontend Setup
1. Clone this repository:
   ```sh
   git clone <your-repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Start the development server:
   ```sh
   npm run dev
   ```

### Backend Setup
1. Make sure you have Python installed (3.8+ recommended)

2. Navigate to the backend directory:
   ```sh
   cd backend
   ```

3. Install Flask and required packages:
   ```sh
   pip install -r requirements.txt
   ```
   
   Note: If you encounter issues installing pyodbc on macOS, you can:
   - Edit requirements.txt to comment out pyodbc and uncomment pymssql
   - Or use the default SQLite mode which requires no additional drivers

4. Configure your database connection:
   - Copy config.py.example to config.py:
     ```sh
     cp config.py.example config.py
     ```
   - Edit config.py to set your preferred database connection:
     - For easy startup, leave as 'sqlite' (creates a demo database automatically)
     - For SQL Server, update connection details and change CONNECTION_TYPE to 'pyodbc' or 'pymssql'

5. Start the Flask server:
   ```sh
   python app.py
   ```

## Database Configuration Options

The application supports three database connection methods:

1. **SQLite** (easiest to get started):
   - No additional setup required
   - Demo data is created automatically
   - Set `CONNECTION_TYPE` to 'sqlite' in config.py

2. **SQL Server via pyodbc**:
   - Requires ODBC drivers to be installed on your system
   - Set `CONNECTION_TYPE` to 'pyodbc' and provide the connection string
   - On macOS, you may need to install unixODBC and the SQL Server driver

3. **SQL Server via pymssql**:
   - Alternative option that may be easier to install on some systems
   - Set `CONNECTION_TYPE` to 'pymssql' and provide server details

## Development
- Frontend runs on port 8080 by default (http://localhost:8080)
- Backend runs on port 5000 by default (http://localhost:5000)
- Demo data is automatically created when using SQLite mode
