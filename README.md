# TerraNebular Mobile App

A React Native mobile application built with Expo for exploring Kigali's zoning regulations with AI-powered insights.

## Features

- 🗺️ Interactive map with Kigali zoning data
- 📍 Current location detection
- 🤖 AI-powered chat interface for zoning questions
- 🎨 Beautiful cosmic-themed UI
- 📱 Fully responsive mobile design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Studio (for Android development)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npm start
```

3. Run on your device:
   - **iOS**: Press `i` in the terminal or scan the QR code with the Camera app (iOS 11+)
   - **Android**: Press `a` in the terminal or scan the QR code with the Expo Go app
   - **Web**: Press `w` in the terminal

## Running on Physical Device

1. Install Expo Go app from App Store (iOS) or Google Play (Android)
2. Scan the QR code displayed in the terminal
3. The app will load on your device

## Project Structure

```
.
├── App.js                 # Main application component
├── components/
│   ├── SplashScreen.js   # Initial splash screen
│   └── Panel.js          # Side panel with location info and chat
├── config/
│   └── constants.js       # API URLs and zone colors
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── babel.config.js       # Babel configuration
```

## API Configuration

The app connects to the backend API at:
- Production: `https://cok-development-assistant.onrender.com/api`

To change the API endpoint, edit `config/constants.js`.

## Features Preserved from Web Version

✅ All original functionality maintained:
- Map interaction and location selection
- Zoning data queries
- AI chat interface
- Current location detection
- Splash screen with animations
- Status indicators
- Zone color coding

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Troubleshooting

- **Map not showing**: Ensure you have internet connection and Google Maps API key is configured (if required)
- **Location not working**: Check that location permissions are granted in device settings
- **Backend connection issues**: Verify the API URL in `config/constants.js` is correct

## License

This project is part of the City of Kigali Development Assistant initiative.

