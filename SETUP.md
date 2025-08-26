# Math Olympiad Prep - Setup Guide

## 🚀 **Getting Started**

### **1. Install Dependencies**
```bash
npm install
```

### **2. MongoDB Setup**

#### **Option A: Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB service
3. Create database: `olympiad-prep`

#### **Option B: MongoDB Atlas (Recommended)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string

### **3. Environment Configuration**
Create a `.env.local` file in the root directory:

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/olympiad-prep

# For MongoDB Atlas, use:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/olympiad-prep?retryWrites=true&w=majority
```

### **4. Run the Application**
```bash
npm run dev
```

## 📋 **Features Implemented**

### **✅ Complete Features:**
- **Home Page**: Hero section, features, exam progression
- **Prerequisites Page**: Required skills and study tips
- **About Us Page**: Team, achievements, mission
- **Curriculum Page**: Comprehensive learning modules
- **Join Page**: Student registration form with MongoDB storage
- **Navigation**: Responsive navbar with Program dropdown

### **✅ Database Schema:**
```javascript
{
  name: String,
  currentClass: String,
  schoolName: String,
  prerequisites: {
    basicMathematics: Boolean,
    algebra: Boolean,
    geometry: Boolean,
    numberTheory: Boolean,
    combinatorics: Boolean
  },
  phoneNumber: String,
  email: String,
  status: String,
  createdAt: Date
}
```

### **✅ Form Features:**
- Client-side validation with Zod
- Server-side validation
- Duplicate email prevention
- Success/error messaging
- Form reset after submission

## 🔧 **API Endpoints**

### **POST /api/students**
- Register new student
- Validates all fields
- Prevents duplicate emails
- Returns success/error messages

### **GET /api/students**
- Fetch all registered students
- Sorted by registration date

## 🎯 **Next Steps (Optional Enhancements)**

1. **Admin Dashboard**: View and manage student applications
2. **Email Notifications**: Send confirmation emails
3. **Payment Integration**: For program fees
4. **Student Portal**: Individual student dashboards
5. **Progress Tracking**: Monitor student progress
6. **Assessment System**: Online tests and evaluations

## 🛠 **Technical Stack**

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Form Handling**: React Hook Form + Zod validation
- **API**: Next.js API Routes

## 📱 **Responsive Design**

The website is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🔒 **Security Features**

- Input validation (client & server)
- SQL injection prevention (MongoDB)
- Email format validation
- Phone number validation
- Duplicate prevention

## 📊 **Database Management**

### **View Data:**
```bash
# Using MongoDB Compass or mongo shell
use olympiad-prep
db.students.find()
```

### **Backup:**
```bash
mongodump --db olympiad-prep --out backup/
```

### **Restore:**
```bash
mongorestore --db olympiad-prep backup/olympiad-prep/
```



