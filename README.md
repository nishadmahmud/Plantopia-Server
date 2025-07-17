# 🌱 Plantopia - Plant E-Commerce Platform

A modern, full-stack e-commerce platform for plant enthusiasts built with React, Node.js, and MongoDB.
---
Live link : [Plantopia](https://plantopia-store.netlify.app/)
---

## 🔐 Admin Login Details

**For testing admin features:**
- **Email:** `admin.plantopia@gmail.com`
- **Password:** `Plantopia`

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## ✨ Features

### 🛒 **E-Commerce Core**
- **Product Catalog:** Browse plants, tools, fertilizers, soils, pottery, and seeds
- **Shopping Cart:** Add, update, and remove items with persistent storage
- **Checkout System:** Secure payment processing with Stripe integration
- **Order Management:** Track orders, view order history, and order status updates
- **Wishlist:** Save favorite products for later purchase

### 👤 **User Management**
- **Authentication:** Firebase-powered login/register with Google OAuth
- **User Profiles:** Customizable profiles with image upload
- **Role-Based Access:** Admin and customer role management
- **Order History:** Complete purchase history with detailed order information

### 🔧 **Admin Dashboard**
- **Product Management:** Add, edit, and delete products across all categories
- **Order Management:** View, update order status, and manage customer orders
- **User Management:** View registered users and their details
- **Blog Management:** Create, edit, and delete blog posts
- **Analytics:** Overview of orders, users, and inventory

### 📱 **User Experience**
- **Responsive Design:** Optimized for desktop, tablet, and mobile devices
- **Search & Filter:** Advanced product search and filtering capabilities
- **Product Reviews:** Customer reviews and ratings system
- **Blog System:** Educational content about plant care and gardening
- **Image Upload:** Multiple image uploads for products and profiles

### 🚀 **Technical Features**
- **Real-time Updates:** Live cart updates and order status changes
- **Image Optimization:** Cloudinary integration for image storage and optimization
- **PWA Ready:** Progressive Web App capabilities
- **SEO Optimized:** Proper meta tags and structured data
- **Error Handling:** Comprehensive error handling and user feedback

---

## 📸 Screenshots

### 🏠 **Homepage**
![Homepage](https://5fpq20sdnj.ufs.sh/f/xqLlvYhpVKhaL64XYKgpqK1RzxD7d962IMTEo3VmJBlwhft8)
*Modern, responsive homepage with featured products and categories*

### 🛒 **Product Catalog**
![Product Catalog](https://5fpq20sdnj.ufs.sh/f/xqLlvYhpVKhaVi38oGtoTlrJyiYwavAIfn0j1KHtLGRW6UXF)
*Browse products with advanced search and filtering capabilities*

### 🛍️ **Shopping Cart**
![Shopping Cart](https://5fpq20sdnj.ufs.sh/f/xqLlvYhpVKhaCTU5EVa8o0fhTbnHLkWQDqcvRdp2mz6juAaP)
*Intuitive shopping cart with quantity controls and price calculations*

### 💳 **Checkout Process**
![Checkout](https://5fpq20sdnj.ufs.sh/f/xqLlvYhpVKhaMTp5SqE6y1AIHwt2NnxLsFEG7zjXS8CbUJYv)
*Secure checkout with Stripe payment integration*

### 👤 **User Profile**
![User Profile](https://5fpq20sdnj.ufs.sh/f/xqLlvYhpVKhauMffeJKYBAURuWqcY8G2vCKi1TJXP7zhSb9r)
*Customizable user profiles with order history and account management*

### ⚡ **Admin Dashboard**
![Admin Dashboard](https://5fpq20sdnj.ufs.sh/f/xqLlvYhpVKhakYvVY3ivO6e0HcJwWzgAFbUDTC7PXZldyQpo)
*Comprehensive admin panel for managing products, orders, and users*

### 📊 **Order Management**
![Order Management](https://5fpq20sdnj.ufs.sh/f/xqLlvYhpVKhatX7CleT9LoVSTAaxZuOWdJ1mNMgIYebwsG3h)
*Efficient order tracking and status management system*

### 📝 **Blog System**
![Blog System](https://5fpq20sdnj.ufs.sh/f/xqLlvYhpVKha3S5asoXKSngldhCHwFi4R9IGZT27OuJVzvYU)
*Educational blog posts about plant care and gardening tips*

### 🎨 **Product Details**
![Product Details](https://5fpq20sdnj.ufs.sh/f/xqLlvYhpVKhazaq069MMIX17H0ZCfVePcGOxjEN3vAbYoDQ6)
*Detailed product pages with images, descriptions, and customer reviews*

---

## 🛠 Tech Stack

### **Frontend**
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Icons** - Icon library
- **Axios** - HTTP client for API calls

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Multer** - File upload middleware
- **Cloudinary** - Image storage and optimization

### **Authentication & Payment**
- **Firebase Auth** - User authentication with Google OAuth
- **Stripe** - Payment processing

### **Deployment**
- **Netlify** - Frontend hosting
- **Vercel/Railway** - Backend hosting
- **MongoDB Atlas** - Database hosting

---

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- Firebase project
- Stripe account
- Cloudinary account

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/plantopia.git
cd plantopia
```

### 2. Install Dependencies

**Frontend:**
```bash
cd Plantopia-Client
npm install
```

**Backend:**
```bash
cd Plantopia-Server
npm install
```

### 3. Environment Variables

Create `.env` files in both client and server directories:

**Client (.env):**
```env
VITE_API_ADDRESS=http://localhost:3000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

**Server (.env):**
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Run the Application

**Start Backend:**
```bash
cd Plantopia-Server
npm run dev
```

**Start Frontend:**
```bash
cd Plantopia-Client
npm run dev
```

The application will be available at `http://localhost:5173`

---

## 📖 Usage

### Customer Flow
1. **Browse Products:** Explore different categories of plants and gardening supplies
2. **Add to Cart:** Select products and add them to your shopping cart
3. **Checkout:** Complete purchase with secure Stripe payment
4. **Track Orders:** Monitor order status and delivery updates
5. **Reviews:** Leave reviews and ratings for purchased products

### Admin Flow
1. **Login:** Use admin credentials to access admin dashboard
2. **Manage Products:** Add, edit, or delete products across all categories
3. **Process Orders:** View and update order statuses
4. **Content Management:** Create and manage blog posts
5. **User Management:** View registered users and their activities

---

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/google` - Google OAuth

### Products
- `GET /api/plants` - Get all plants
- `GET /api/tools` - Get all tools
- `GET /api/fertilizers` - Get all fertilizers
- `GET /api/soils` - Get all soils
- `POST /api/plants` - Create new plant (Admin)
- `PUT /api/plants/:id` - Update plant (Admin)
- `DELETE /api/plants/:id` - Delete plant (Admin)

### Orders
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/:userId` - Get user orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Cart & Wishlist
- `GET /api/cart/:userId` - Get user cart
- `PUT /api/cart/:userId` - Update user cart
- `GET /api/users/:userId/wishlist` - Get user wishlist
- `POST /api/users/:userId/wishlist` - Add to wishlist
- `DELETE /api/users/:userId/wishlist/:productId` - Remove from wishlist

---

## 🚀 Deployment

### Frontend (Netlify)
1. Build the project: `npm run build`
2. Connect your repository to Netlify
3. Set environment variables in Netlify dashboard
4. Deploy with build command: `npm run build`

### Backend (Vercel/Railway)
1. Connect your repository to hosting platform
2. Set environment variables
3. Deploy with start command: `npm start`

### Database (MongoDB Atlas)
1. Create MongoDB Atlas cluster
2. Configure network access
3. Update connection string in environment variables

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

