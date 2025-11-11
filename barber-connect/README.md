# BarberConnect 💈

**The Premier Social Platform for Barbers and Clients**

BarberConnect is a fully-featured mobile application built with React Native, Expo, and Firebase that revolutionizes the barbering industry by combining social networking, booking management, real-time messaging, and professional development into one seamless platform.

🔥 **Status:** Fully Integrated with Firebase | 37 Screens | Production Ready

---

## 🌟 Key Features

### For Clients
- ✅ **Discover Top Barbers**: Browse and search barbers by location, rating, and specialty
- ✅ **Instant Booking**: Book appointments 24/7 with real-time availability checking
- ✅ **Social Feed**: Follow barbers, like and comment on transformations
- ✅ **Save Favorites**: Bookmark favorite barbers and hairstyle inspirations
- ✅ **Real-time Chat**: Direct messaging with barbers for consultations
- ✅ **Push Notifications**: Get notified about bookings, messages, and updates
- ✅ **Location-Based Search**: Find nearby barbers with GPS and map view
- ✅ **Booking History**: Track all past and upcoming appointments

### For Barbers
- ✅ **Professional Portfolio**: Showcase your work with unlimited photo uploads
- ✅ **Social Presence**: Build your brand with Instagram-style feed and stories
- ✅ **Booking Management**: Accept and manage appointments with calendar view
- ✅ **Service Management**: Set custom services, pricing, and duration
- ✅ **Schedule Editor**: Define working hours and availability
- ✅ **Client Engagement**: Real-time messaging with clients
- ✅ **Analytics Dashboard**: Track revenue, bookings, and client metrics
- ✅ **Reviews & Ratings**: Receive and respond to client reviews
- ✅ **Promotion Tiers**: Feature your profile with premium plans

### For Business Owners
- ✅ **Team Management**: Manage multiple barbers under one account
- ✅ **Job Board**: Post hiring opportunities and view applications
- ✅ **Business Analytics**: Comprehensive performance insights
- ✅ **Multi-location Support**: Manage multiple shop locations
- ✅ **Promotion Management**: Boost visibility with featured listings

## 🎨 Design Philosophy

BarberConnect features a sleek, professional design with:
- **Dark Mode First**: Premium black and gold aesthetic
- **Social Media UX**: Familiar interface inspired by Instagram and TikTok
- **Smooth Animations**: Powered by React Native Reanimated
- **Responsive Design**: Optimized for all screen sizes
- **Accessibility**: WCAG 2.1 compliant

## 🏗️ Tech Stack

### Frontend
- **React Native** (with Expo SDK 51.x) - Cross-platform mobile framework
- **TypeScript** - Type safety and better developer experience
- **React Navigation v6** - Seamless screen navigation
- **Expo Linear Gradient** - Beautiful gradient UI effects
- **React Native Gesture Handler** - Smooth touch interactions

### Backend & Services
- **Firebase Authentication** - Email/password and OAuth sign-in
- **Cloud Firestore** - NoSQL database with real-time sync
- **Firebase Storage** - Cloud storage for images and media
- **Firebase Cloud Messaging** - Push notifications
- **Expo Notifications** - Local and remote notifications
- **Expo Location** - GPS and geolocation services
- **Expo Image Picker** - Camera and photo library access

### State Management & Storage
- **React Context API** - Global state management
- **AsyncStorage** - Local data persistence
- **Firebase Offline Persistence** - Offline data caching

### Development Tools
- **Expo CLI** - Development and build tooling
- **TypeScript** - Static type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📱 Screenshots

Coming soon...

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac only) or Android Studio
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/barber-connect.git
   cd barber-connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your device**
   - **iOS**: Press `i` in the terminal or scan QR code with Camera app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device (Mac only)
- `npm run web` - Run in web browser

## 📁 Project Structure

```
barber-connect/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Common components (Button, Input, etc.)
│   │   ├── feed/           # Feed-related components
│   │   ├── profile/        # Profile components
│   │   └── booking/        # Booking components
│   ├── screens/            # Screen components
│   │   ├── auth/           # Authentication screens
│   │   ├── home/           # Home/Feed screens
│   │   ├── profile/        # Profile screens
│   │   ├── search/         # Search/Discover screens
│   │   ├── booking/        # Booking screens
│   │   ├── messaging/      # Messaging screens
│   │   ├── marketplace/    # Marketplace screens
│   │   └── jobs/           # Job board screens
│   ├── navigation/         # Navigation configuration
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── store/              # State management (Zustand)
│   │   └── authStore.ts
│   ├── services/           # API and service integrations
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   │   ├── user.types.ts
│   │   ├── auth.types.ts
│   │   ├── post.types.ts
│   │   ├── booking.types.ts
│   │   └── job.types.ts
│   ├── theme/              # Design system
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   └── assets/             # Images, fonts, icons
├── App.tsx                 # Entry point
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 Authentication System

BarberConnect implements a **three-tier account system**:

1. **Client Account**
   - Book appointments
   - Follow barbers
   - Save favorite styles
   - Loyalty rewards

2. **Barber Account**
   - Create professional portfolio
   - Accept bookings
   - Post content
   - Sell products
   - Build social following

3. **Business Owner Account**
   - Manage team of barbers
   - Post job openings
   - Offer mentorship programs
   - Multi-location management
   - Advanced analytics

### Security Features
- JWT-based authentication
- Secure password hashing (bcrypt)
- Two-factor authentication (2FA) support
- Email and phone verification
- Session management
- OAuth integration (Google, Apple)

## 🎯 Roadmap

### Phase 1: MVP (Current)
- ✅ Authentication system
- ✅ User profiles (Client, Barber, Business Owner)
- ✅ Social feed
- ✅ Basic booking system
- ✅ Search and discovery

### Phase 2: Core Features
- [ ] Real-time messaging
- [ ] Stories and Reels
- [ ] Payment integration (Stripe)
- [ ] Push notifications
- [ ] Advanced search filters
- [ ] Review and rating system

### Phase 3: Social Enhancement
- [ ] Live streaming
- [ ] Video tutorials
- [ ] Barber challenges
- [ ] Trending leaderboards
- [ ] Group bookings
- [ ] Referral system

### Phase 4: Business Tools
- [ ] Job board with applications
- [ ] Mentorship programs
- [ ] Product marketplace
- [ ] Inventory management
- [ ] Advanced analytics
- [ ] Marketing tools

### Phase 5: AI & Advanced
- [ ] AI style recommendations
- [ ] Virtual try-on (AR)
- [ ] Automated scheduling
- [ ] Chatbot support
- [ ] Predictive analytics
- [ ] Multi-language support

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📚 Documentation

Comprehensive documentation is available:

- **[Setup Guide](./SETUP_GUIDE.md)** - Complete setup instructions for developers
- **[Integration Complete](./INTEGRATION_COMPLETE.md)** - All Firebase integrations and features
- **[API Reference](./API_REFERENCE.md)** - Detailed API documentation for all services
- **[Contributing Guidelines](./CONTRIBUTING.md)** - How to contribute to the project (coming soon)

## 🧪 Testing

### Run Tests
```bash
# Unit tests (coming soon)
npm test

# E2E tests (coming soon)
npm run test:e2e
```

### Manual Testing Checklist
See [INTEGRATION_COMPLETE.md](./INTEGRATION_COMPLETE.md#testing-checklist) for a comprehensive testing checklist.

## 🚀 Deployment

### Build for Production

#### iOS Build
```bash
eas build --platform ios
```

#### Android Build
```bash
eas build --platform android
```

### Environment Configuration
Create separate Firebase projects for:
- Development
- Staging
- Production

Update environment variables accordingly in `.env` files.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

BarberConnect is built with passion by developers who understand the barbering industry.

## 📞 Support

- **Email**: support@barberconnect.app
- **Discord**: [Join our community](https://discord.gg/barberconnect)
- **Twitter**: [@BarberConnect](https://twitter.com/barberconnect)

## 🙏 Acknowledgments

- Design inspiration from Instagram, TikTok, and TheClutch
- Icons by [Expo Vector Icons](https://icons.expo.fyi/)
- Community feedback from barbers and clients worldwide

---

**Built with ❤️ for the barbering community**
