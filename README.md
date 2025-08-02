# Finance Tracker

A simple web-based finance tracking application with a Python FastAPI backend and React Material-UI frontend.

## Features

- **CSV Upload**: Upload transaction data with date, description, amount spent, and amount received
- **Keyword Tagging**: Automatically tag transactions based on configurable keywords
- **Data Visualization**: View spending patterns with pie charts and bar charts
- **Time-based Analysis**: Analyze data monthly, yearly, or all-time
- **Transaction Management**: Search and view all transactions
- **Keyword Management**: Add/remove keywords for automatic tagging

## Technology Stack

- **Backend**: Python, FastAPI, SQLAlchemy, PostgreSQL
- **Frontend**: React, Material-UI, MUI X Charts
- **Database**: PostgreSQL
- **Containerization**: Podman/Docker with multi-container setup

## CSV Format

Your CSV file should have the following columns:
1. **Date** (YYYY-MM-DD format)
2. **Description** (transaction description)
3. **Amount Spent** (positive number or 0)
4. **Amount Received** (positive number or 0)

Example:
```csv
2024-01-15,Grocery Store Purchase,45.67,0
2024-01-16,Salary Payment,0,2500.00
2024-01-17,Gas Station,32.45,0
```

## Quick Start

### Prerequisites
- Podman (or Docker)
- Git

### Setup and Run

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd finance-tracker
   ```

2. **Start the application**:
   ```bash
   podman-compose up --build
   ```
   or
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Database: localhost:5432

4. **First time setup**:
   - Navigate to the "Keywords" tab to set up automatic tagging rules
   - Go to "Upload CSV" to import your transaction data
   - View analytics in the "Dashboard" tab

## Development Setup

### Backend Development

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # Linux/Mac
   # or
   venv\Scripts\activate     # Windows
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set environment variables**:
   ```bash
   export DATABASE_URL="postgresql://finance_user:finance_pass@localhost:5432/finance_tracker"
   ```

5. **Run the backend**:
   ```bash
   python main.py
   ```

### Frontend Development

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

## API Endpoints

- `POST /upload-csv` - Upload CSV file
- `GET /transactions` - Get all transactions
- `GET /keywords` - Get all keywords
- `POST /keywords` - Create new keyword
- `DELETE /keywords/{id}` - Delete keyword
- `GET /charts/monthly` - Get monthly chart data
- `GET /charts/yearly` - Get yearly chart data
- `GET /charts/all-time` - Get all-time chart data

## Container Architecture

- **Backend**: Fedora-based container with Python 3 and FastAPI
- **Frontend**: Node.js Alpine container with React build
- **Database**: PostgreSQL Alpine container
- **Orchestration**: Docker Compose for multi-container setup

## Future Enhancements

The Python backend is designed to be easily extensible. You can add:
- Custom transaction categorization logic
- Advanced financial analytics
- Integration with banking APIs
- Export functionality
- User authentication
- Multi-user support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license information here]
