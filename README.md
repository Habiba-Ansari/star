# 🌟 Star - Wish Fulfillment Platform

Star is a social platform where users can share their wishes and help fulfill others' wishes. Create wishes, offer help, connect with others, and make dreams come true!

## ✨ Features

### 🎯 Core Functionality
- **Wish Creation**: Share your wishes with details like category, urgency, and location
- **Wish Fulfillment**: Offer to help others fulfill their wishes
- **Real-time Chat**: Communicate with wish owners/fulfillers through integrated messaging
- **Voting System**: Like/dislike wishes to show support
- **Anonymous Posting**: Option to post wishes anonymously

### 🏆 Social Features
- **Leaderboard**: Track top wish fulfillers in the community
- **User Profiles**: View other users' profiles and wish history
- **Notifications**: Get notified when someone offers to fulfill your wish

### 🔧 Technical Features
- **Real-time Updates**: Live updates for new wishes, messages, and votes
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **PWA Support**: Install as a progressive web app
- **Google Authentication**: Secure login with Google accounts

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/star-app.git
   cd star-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Google provider)
   - Create Firestore Database
   - Enable Storage
   - Copy your Firebase config

4. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

5. **Run the application**
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🏗️ Project Structure

```
src/
├── components/          # Reusable components
│   ├── Home.js         # Main feed component
│   ├── Leaderboard.js  # Leaderboard component
│   ├── ChatCorner.js   # Chat sidebar component
│   └── ChatScreen.js   # Full chat interface
├── firebase.js         # Firebase configuration
├── App.js              # Main app component
├── App.css             # Global styles
└── index.js            # Application entry point
```

## 🔥 Firebase Collections

- **wishes**: All user wishes with metadata
- **users**: User profiles and information
- **chats**: Chat sessions between users
- **messages**: Individual chat messages
- **votes**: Like/dislike records
- **notifications**: In-app notifications

## 🎨 UI Components

### Home Page Layout
```
+----------------+---------------------+----------------+
|                |                     |                |
|  Leaderboard   |     Wishes Feed     |   Chat Corner  |
|    (Left)      |      (Middle)       |    (Right)     |
|                |                     |                |
+----------------+---------------------+----------------+
```

### Wish Card Features
- User avatar and username
- Wish description and details
- Urgency rating (1-5 stars)
- Category and location tags
- Like/dislike buttons
- Fulfill/Complete action buttons
- Delete option for wish owners

## 🤝 How to Use

### Creating a Wish
1. Log in to your account
2. Click "Create Wish" button
3. Fill in wish details (text, category, urgency, location)
4. Choose to post anonymously or with your username
5. Submit to share with the community

### Fulfilling a Wish
1. Browse wishes in the main feed
2. Click "Fulfill" on a wish you can help with
3. Chat with the wish owner to coordinate
4. Complete the fulfillment process

### Completing a Wish
1. As a wish owner, click "Complete" when your wish is fulfilled
2. Verify the fulfiller's username
3. Send a gratitude message
4. The wish is marked as fulfilled and leaderboard is updated

## 🛠️ Technologies Used

- **Frontend**: React.js, React Router, React Icons
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Styling**: CSS3 with Flexbox/Grid
- **Deployment**: Firebase Hosting
- **Real-time**: Firebase Realtime Listeners

## 📱 Progressive Web App

Star is a PWA that can be:
- Installed on your device
- Used offline (with cached data)
- Accessed from home screen

## 🔒 Privacy & Security

- Email addresses are kept private
- Anonymous posting option available
- Secure Google authentication
- Data encryption in transit and at rest

## 🚀 Deployment

To deploy to Firebase Hosting:

```bash
npm run build
firebase deploy
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Firebase team for excellent documentation
- React community for amazing tools and libraries
- All contributors and testers

## 📞 Support

If you have any questions or need help, please:
1. Check the [FAQ](#) section
2. Open an issue on GitHub
3. Contact us at support@starapp.com

---

<div align="center">
Made with ❤️ by the Star team
</div>
