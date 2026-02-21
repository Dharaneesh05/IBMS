# IBMS - Inventory Billing Management System

A full-stack jewelry inventory and billing management system built with React and Node.js.

## Features

- **Product Management** - Track jewelry inventory with images, categories, and stock levels
- **Designer Management** - Manage designer information and their products
- **Real-time Notifications** - Live stock alerts and inventory monitoring via WebSocket
- **Dashboard** - Comprehensive overview of sales, inventory, and activities

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Socket.IO Client
- Axios

### Backend
- Node.js
- Express.js
- PostgreSQL
- Socket.IO
- Sequelize ORM

## Project Structure

```
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
│
└── frontend/
    ├── public/          # Static assets
    └── src/
        ├── api/         # API client
        ├── components/  # React components
        └── contexts/    # React contexts
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example` and configure your database credentials

4. Run database setup:
```bash
node setup-database.js
```

5. Start the server:
```bash
npm start
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example` and configure the API URL

4. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Deployment

- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Railway

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is private and proprietary.
