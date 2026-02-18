# 💎 Jewellery Inventory System

A full-stack web application for managing jewellery shop inventory, sales, and designers.

![Tech Stack](https://img.shields.io/badge/React-18.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MySQL](https://img.shields.io/badge/Database-MySQL-orange)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

---

## ✨ Features

### 📦 Inventory Management
- ➕ Add, edit, and delete jewellery products
- 🔍 Advanced search and filtering
- 📊 Stock level monitoring (Low stock alerts)
- 💰 Cost and pricing management
- 🏷️ Product categorization by type

### 👨‍🎨 Designer Management
- 👤 Create and manage designer profiles
- 📞 Track contact information
- 📈 Commission tracking
- 🔗 Link products to designers

### 📊 Dashboard & Analytics
- 📈 Real-time inventory statistics
- 💵 Total stock value calculation
- ⚠️ Reorder alerts
- 📉 Low stock monitoring
- 🎯 Quick insights panel

### 🎨 UI/UX Features
- 🌓 Dark/Light mode
- 📱 Fully responsive design
- 🗂️ Multiple view modes (Table/Grid)
- ⚡ Compact view option
- 🔎 Scoped search functionality
- 📤 Import/Export capabilities (Coming soon)
- ✅ Bulk operations

---

## 🛠️ Tech Stack

**Frontend:**
- React 18.2
- React Router DOM 6.8
- Axios for API calls
- Tailwind CSS for styling
- Context API for state management

**Backend:**
- Node.js with Express 4.18
- MySQL 8.0
- Sequelize ORM 6.35
- CORS enabled
- RESTful API architecture

---

## 📁 Project Structure

```
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── server.js        # Express server
│   ├── setup-database.js
│   └── seed-database.js # Sample data
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/         # API client
│       ├── components/  # React components
│       ├── contexts/    # Context providers
│       └── App.js
│
├── DEPLOYMENT.md        # Deployment guide
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MySQL (v8.0+)
- npm or yarn

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MySQL credentials
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=jewellery_shop

# Setup database and tables
npm run setup

# (Optional) Seed sample data
npm run seed

# Start backend server
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start frontend
npm start
```

Frontend will run on `http://localhost:3000`

---

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step deployment guide.

**Free Hosting Options:**
- **Backend + Database**: Railway.app (includes MySQL)
- **Frontend**: Vercel (unlimited deployments)

Your app will be live in under 10 minutes! 🎉

---

## 📸 Screenshots

### Product List View
- Table and Grid view modes
- Advanced filtering and sorting
- Stock status indicators

### Dashboard
- Real-time analytics
- Stock value calculations
- Quick insights panel

### Designer Management
- Create and edit designer profiles
- Track commissions
- View designer's products

---

## 🔐 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=jewellery_shop
DB_USER=root
DB_PASSWORD=
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📡 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/types/all` - Get all product types

### Designers
- `GET /api/designers` - Get all designers
- `GET /api/designers/:id` - Get designer by ID
- `POST /api/designers` - Create new designer
- `PUT /api/designers/:id` - Update designer
- `DELETE /api/designers/:id` - Delete designer

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Metal Rates
- `GET /api/metal-rates` - Get current metal rates
- `PUT /api/metal-rates` - Update metal rates

---

## 🗄️ Database Schema

### Products
- id, name, type, sku, quantity
- cost, price, metal_purity, metal_weight
- stone_type, stone_weight, designer_id
- createdAt, updatedAt

### Designers
- id, name, email, phone
- address, commission_rate
- createdAt, updatedAt

---

## 🎯 Usage

1. **Add Products**: Click "Add Product" button
2. **Search & Filter**: Use search bar and category filters
3. **View Details**: Click on any product card/row
4. **Edit**: Click Edit button on product
5. **Bulk Operations**: Select multiple items and perform actions
6. **Switch Views**: Toggle between Table and Grid views
7. **Dark Mode**: Toggle in settings (Coming soon)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

ISC License

---

## 👨‍💻 Developer

Built with ❤️ for jewellery shop management

---

## 🐛 Bug Reports

If you find a bug, please open an issue with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)

---

## 🔮 Future Enhancements

- [ ] Sales transaction management
- [ ] Invoice generation
- [ ] Payment tracking
- [ ] Customer management
- [ ] Advanced reporting
- [ ] Multi-user authentication
- [ ] Email notifications
- [ ] Barcode scanning
- [ ] Image upload for products
- [ ] Export to Excel/PDF

---

## 📞 Support

For support, please open an issue in the GitHub repository.

---

**Made for efficient jewellery inventory management** 💎
