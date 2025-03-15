
# Foot Scanning Analytics Dashboard

## Project Overview
This is a dashboard application for visualizing foot scanning analytics data. It provides:
- Scan activity visualization and mapping
- Recommendation tracking and analysis
- Size heatmap visualization with demographic breakdowns

## Technical Stack
- **Frontend**: React, TypeScript, Recharts, shadcn/ui, Tailwind CSS
- **Backend**: Flask with pyodbc for SQL Server connections

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

2. Navigate to the backend directory (create it if it doesn't exist):
   ```sh
   cd backend
   ```

3. Install Flask and required packages:
   ```sh
   pip install flask pyodbc
   ```

4. Create a config.py file with your database connection:
   ```python
   DB_CONFIG = {
       'DATABASE_CONNECTION_STRING': 'DRIVER={SQL Server};SERVER=your_server;DATABASE=your_database;UID=your_username;PWD=your_password'
   }
   ```

5. Start the Flask server:
   ```sh
   python app.py
   ```

## Configuration
- The frontend makes API calls to the backend endpoints at `/data`, `/recommendation_data`, and `/size_heatmap_data`
- Ensure both frontend and backend are running for the application to work properly

## Development
- Frontend runs on port 8080 by default (http://localhost:8080)
- Backend runs on port 5000 by default (http://localhost:5000)
- Make sure CORS is properly configured if running on different domains
