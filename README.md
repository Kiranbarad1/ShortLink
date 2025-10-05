# ShortLinker - URL Shortener

A production-ready URL shortener built with Next.js 14 (App Router) and MongoDB Atlas, featuring user authentication, custom aliases, click tracking, and dark mode.

## 🚀 Features

- **URL Shortening**: Convert long URLs into short, shareable links
- **Custom Aliases**: Create memorable custom aliases for your links
- **Click Tracking**: Monitor how many times your links are clicked
- **User Authentication**: Secure login with NextAuth.js (Google OAuth + Credentials)
- **User Dashboard**: Manage all your links in one place
- **Dark/Light Mode**: Toggle between themes with persistence
- **Responsive Design**: Works perfectly on all devices
- **Real-time Analytics**: Track link performance instantly

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB Atlas, Mongoose
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS with dark mode support
- **Notifications**: React Hot Toast
- **ID Generation**: Nanoid for short codes

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shortlinker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your values:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   JWT_SECRET=your-jwt-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

The application uses a simple MongoDB schema for links:

```javascript
{
  userId: String,        // User ID from auth (null for anonymous)
  originalUrl: String,   // The original long URL
  shortCode: String,     // The short code (unique)
  customAlias: String,   // Custom alias (optional)
  clicks: Number,        // Click count (default: 0)
  createdAt: Date       // Creation timestamp
}
```

## 🔐 Authentication

The app supports multiple authentication methods:

- **Google OAuth**: Sign in with Google account
- **Email/Password**: Traditional credentials-based login
- **Anonymous Usage**: Create links without signing up (not saved to user account)

## 📱 Usage

### Creating Short Links

1. **Homepage**: Enter any URL and click "Shorten Link"
2. **Custom Alias**: Check "Use custom alias" to create memorable links
3. **Copy & Share**: Use the copy button to share your short link

### Managing Links (Authenticated Users)

1. **Dashboard**: View all your created links
2. **Analytics**: See click counts and creation dates
3. **Delete**: Remove links you no longer need
4. **Copy**: Quick copy buttons for easy sharing

### Anonymous Users

- Can create short links without signing up
- Links are not saved to any account
- Encouraged to sign up for link management

## 🎨 Customization

### Themes
- Built-in dark/light mode toggle
- Persistent theme selection
- Smooth transitions between modes

### Styling
- Tailwind CSS for rapid customization
- Glassmorphism effects
- Responsive design patterns

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Other Platforms

The app can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📊 API Endpoints

- `POST /api/create` - Create a new short link
- `GET /api/links` - Fetch user's links (authenticated)
- `DELETE /api/delete/[id]` - Delete a link (authenticated)
- `GET /s/[slug]` - Redirect to original URL

## 🔧 Configuration

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Add it to your `.env.local` file

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs
6. Add client ID and secret to `.env.local`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 🎯 Roadmap

- [ ] QR Code generation for links
- [ ] Bulk link creation
- [ ] Link expiration dates
- [ ] Advanced analytics dashboard
- [ ] API rate limiting
- [ ] Link categories/tags
- [ ] Export functionality

---

Built with ❤️ using Next.js and MongoDB Atlas