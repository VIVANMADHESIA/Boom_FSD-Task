# 🚀 BOOM - Next-Generation Social Streaming Platform

A full-stack social streaming platform that combines short-form and long-form video content with robust community features and monetization capabilities.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🔐 Authentication
- User registration with email/username & password
- JWT-based secure authentication
- Automatic token management

### 📹 Video Management
- **Short-form videos**: Upload MP4 files (max 10MB)
- **Long-form videos**: Share external video URLs (YouTube, Vimeo, etc.)
- Video metadata storage (title, description, creator info)
- Automatic file handling and serving

### 📱 Unified Feed
- Mixed short-form and long-form video display
- Chronological sorting (newest first)
- Infinite scroll pagination
- Auto-play for short-form videos on hover

### 💰 Monetization
- **Mock Wallet System**: Users start with ₹500 balance
- **Video Purchasing**: Buy access to paid long-form content
- **Creator Gifting**: Send money directly to content creators
- Real-time balance updates

### 💬 Social Features
- **Comments System**: Add and view comments on videos
- **User Interactions**: Like, share, and engage with content
- **Creator Profiles**: View creator information and content

### 🎯 Additional Features
- Responsive design (mobile & desktop)
- Real-time updates
- Error handling and validation
- Clean, modern UI with Tailwind CSS

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **Lucide React** - Beautiful icons

### Backend
- **Next.js API Routes** - Serverless backend functions
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Node.js File System** - File upload handling

### Database
- **In-Memory Storage** - For prototype/development
- Easily replaceable with PostgreSQL, MongoDB, or MySQL

## 🚀 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/boom-platform.git
   cd boom-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Create uploads directory**
   ```bash
   mkdir public/uploads
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

5. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```env
JWT_SECRET=your-super-secret-jwt-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Required Variables
- `JWT_SECRET`: Secret key for JWT token signing (required)
- `NEXT_PUBLIC_APP_URL`: Base URL of your application (optional)

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "wallet": 500
  }
}
```

#### POST /api/auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Video Endpoints

#### GET /api/videos
Get paginated list of videos.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)

#### POST /api/videos/upload
Upload a new video.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `title`: Video title
- `description`: Video description
- `type`: "short-form" or "long-form"
- `videoFile`: MP4 file (for short-form)
- `videoUrl`: External URL (for long-form)
- `price`: Price in rupees (for long-form)

#### POST /api/videos/purchase
Purchase a paid video.

**Request Body:**
```json
{
  "videoId": "1"
}
```

### Interaction Endpoints

#### GET /api/videos/[id]/comments
Get comments for a specific video.

#### POST /api/videos/[id]/comments
Add a comment to a video.

**Request Body:**
```json
{
  "text": "Great video!"
}
```

#### POST /api/videos/[id]/gift
Send a gift to the video creator.

**Request Body:**
```json
{
  "amount": 50
}
```

## 📖 Usage Guide

### For Users

1. **Registration**
   - Visit the homepage
   - Click "Sign Up" and fill in your details
   - You'll receive ₹500 starting balance

2. **Browsing Videos**
   - Navigate to the feed page
   - Scroll through mixed short and long-form content
   - Hover over short videos for auto-play

3. **Purchasing Content**
   - Click "Buy for ₹XX" on paid long-form videos
   - Confirm purchase (balance will be deducted)
   - Access granted immediately

4. **Interacting with Content**
   - Click on videos to open full player
   - Add comments and engage with creators
   - Send gifts to support your favorite creators

### For Creators

1. **Upload Short-form Videos**
   - Click "Upload" button
   - Select "Short-form" type
   - Upload MP4 file (max 10MB)
   - Add title and description

2. **Share Long-form Content**
   - Select "Long-form" type
   - Paste YouTube/Vimeo URL
   - Set price (0 for free, or premium amount)
   - Publish to feed

3. **Monetization**
   - Set prices for premium long-form content
   - Receive gifts from viewers
   - Track earnings through wallet system

## 📁 Project Structure

```
boom-platform/
├── app/
│   ├── api/                    # Backend API routes
│   │   ├── auth/              # Authentication endpoints
│   │   └── videos/            # Video management endpoints
│   ├── feed/                  # Main video feed page
│   ├── upload/                # Video upload page
│   ├── video/[id]/           # Individual video player page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout component
│   └── page.tsx              # Homepage/auth page
├── components/
│   └── ui/                   # Reusable UI components
├── lib/
│   ├── auth.ts              # Authentication utilities
│   └── utils.ts             # General utilities
├── public/
│   └── uploads/             # Uploaded video files
├── middleware.ts            # Next.js middleware
├── package.json            # Dependencies and scripts
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Short-form video upload
- [ ] Long-form video URL sharing
- [ ] Video feed browsing
- [ ] Video purchasing flow
- [ ] Comment system
- [ ] Creator gifting
- [ ] Wallet balance updates
- [ ] Responsive design on mobile

### Test Data

Use these sample YouTube URLs for testing long-form videos:
- `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- `https://www.youtube.com/watch?v=jNQXAC9IVRw`

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Environment Variables in Vercel**
   - `JWT_SECRET`: Your secret key
   - `NEXT_PUBLIC_APP_URL`: Your production URL

### Other Platforms

The app can also be deployed to:
- Netlify
- Railway
- Heroku
- DigitalOcean App Platform

## 🔮 Future Enhancements

### Planned Features
- [ ] Real database integration (PostgreSQL/MongoDB)
- [ ] Video streaming optimization (HLS/DASH)
- [ ] Advanced search and filtering
- [ ] User profiles and following system
- [ ] Push notifications
- [ ] Video analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Live streaming capabilities
- [ ] Advanced monetization (subscriptions, tips)

### Technical Improvements
- [ ] Redis caching
- [ ] CDN integration for video delivery
- [ ] Advanced security measures
- [ ] Performance monitoring
- [ ] Automated testing suite
- [ ] CI/CD pipeline

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Lucide](https://lucide.dev/) - Beautiful & consistent icons
- [Vercel](https://vercel.com/) - Deployment and hosting platform

## 📞 Support

If you have any questions or need help:

- 📧 Email: support@boom-platform.com
- 💬 Discord: [Join our community](https://discord.gg/boom-platform)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/boom-platform/issues)
- 📖 Docs: [Documentation](https://docs.boom-platform.com)

---

**Made with ❤️ by the Boom Team**

*Building the future of social streaming, one video at a time.*
```

Yeh comprehensive README file hai jo aapke Boom platform ke liye complete documentation provide karta hai! 📚

## Key Sections Include:

✅ **Complete feature overview**  
✅ **Step-by-step installation guide**  
✅ **API documentation with examples**  
✅ **Usage guide for users and creators**  
✅ **Project structure explanation**  
✅ **Deployment instructions**  
✅ **Contributing guidelines**  
✅ **Future roadmap**  

Yeh README file aapke project ko professional aur well-documented banata hai, jo developers aur users dono ke liye helpful hai! 🚀
