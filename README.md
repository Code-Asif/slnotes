# MaterialPro - MERN Notes-Sharing & Monetization Platform

A fully production-ready MERN-stack web application that allows coaching institutes to sell and distribute educational PDFs (class notes, test papers, DPPs, modules) with zero friction for buyers.

## 🚀 Key Features

- **No Mandatory Registration**: Buyers can purchase materials with just email and mobile
- **Instant Downloads**: Download PDFs immediately after payment (no email links, no expiring URLs)
- **Secure Admin Panel**: Admin-only backend with seeded credentials
- **Razorpay Integration**: Full INR payment integration with webhook fallback
- **GridFS Storage**: All files stored securely in MongoDB Atlas GridFS
- **Modern UI**: Mobile-first interface with MUI + subtle 3D enhancements (react-three-fiber)
- **Deploy Ready**: Configured for Vercel (frontend) + Render (backend)

## 📋 Tech Stack

### Frontend
- React 18 + Vite
- Material-UI (MUI) v5
- React Router v6
- Zustand (state management)
- Axios
- Framer Motion (animations)
- react-three-fiber + drei (3D elements)
- react-hot-toast (notifications)
- react-helmet-async (SEO)
- react-google-recaptcha-v3

### Backend
- Node.js 20 + Express
- Mongoose 8+
- GridFSBucket (MongoDB file storage)
- Razorpay Node SDK
- bcryptjs, jsonwebtoken
- express-rate-limit, helmet, cors, compression
- winston + morgan (logging)
- google-recaptcha (verification)
- pdfjs-dist + canvas (PDF processing)

### Database
- MongoDB Atlas (with GridFS)

## 🎨 UI Features

- Fully responsive (mobile-first)
- Custom MUI theme
- Smooth page transitions (Framer Motion)
- 3D floating book on homepage (react-three-fiber)
- Loading skeletons
- Dark mode ready (theme supports it)
- SEO optimized (react-helmet-async)

## 📝 File Upload Limits

- **PDF Size**: Maximum 100 MB
- **Supported Formats**: PDF only
- **Cover Image**: Optional, any image format
- **Automatic Preview**: First page of PDF extracted as preview image

## 🧪 Testing

Run tests (if implemented):
```bash
cd backend
npm test
```

## 📄 License

ISC

## 🤝 Contributing

This is a production-ready project. Contributions are welcome!

## 📧 Support

For issues or questions, please open an issue on GitHub.

## 🎯 Roadmap

- [ ] Email receipts after purchase
- [ ] Bulk upload via CSV + ZIP
- [ ] Download count analytics dashboard
- [ ] Affiliate/referral tracking
- [ ] Sitemap.xml generation
- [ ] Advanced SEO meta tags
- [ ] Dark mode toggle
- [ ] Multi-admin support

---

**Built with ❤️ for educational institutes**

