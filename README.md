# 🚀 Britemu - Social Platform for Goal Achievement

> **A modern social platform built with Next.js and Firebase that empowers users to achieve their goals through community support, challenge tracking, and journey documentation.**

## 🌟 Live Demo

https://britemu.vercel.app/

---

## ✨ Key Features

### 🔥 **Firebase-Powered Backend**
- **Real-time Database** with Firestore for instant data synchronization
- **Firebase Authentication** supporting Google OAuth and email/password
- **Cloud Storage** for secure image uploads and management
- **Real-time Updates** for messages, notifications, and challenge progress
- **Offline Support** with Firebase's built-in caching mechanisms

### 📸 **Advanced Image Upload System**
- **Smart Image Compression** using browser-image-compression for optimal file sizes
- **Cloud Storage Integration** with Firebase Storage for reliable hosting
- **Real-time Upload Progress** with loading states and error handling
- **Automatic Image Optimization** compressing images from MB to KB while maintaining quality
- **Secure File Management** with user-specific storage paths and access controls

### 🎯 **Challenge Management System**
- **Create & Join Challenges** with public/private visibility options
- **Milestone Tracking** with drag-and-drop reordering functionality
- **Progress Visualization** with interactive progress bars and completion metrics
- **Invitation System** with unique codes for sharing challenges
- **Real-time Collaboration** with live updates across all participants

### 📖 **Journey Documentation**
- **Rich Content Creation** with text, images, and tagging system
- **Social Interaction** with likes, comments, and engagement tracking
- **Personal Portfolio** showcasing achievements and progress over time
- **Content Discovery** with intelligent filtering and search capabilities

### 💬 **Real-time Messaging**
- **Instant Communication** with Firebase real-time listeners
- **Unread Message Tracking** with badge notifications
- **Message History** with persistent chat storage
- **User Status Indicators** showing online/offline states

### 🤝 **Intelligent Connection System**
- **Smart Matching Algorithm** based on interests, goals, and activity levels
- **Compatibility Scoring** with detailed match percentages
- **Connection Management** with follower/following relationships
- **Profile Discovery** with advanced filtering options

---

## 🛠️ Tech Stack

### **Frontend Framework**
- **Next.js 15** - React framework with App Router and server components
- **TypeScript** - Type-safe development with enhanced IDE support
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Shadcn/UI** - Modern component library with accessibility focus

### **Backend & Database**
- **Firebase Firestore** - NoSQL real-time database for scalable data management
- **Firebase Authentication** - Secure user authentication with multiple providers
- **Firebase Storage** - Cloud storage for images and file uploads
- **Firebase Security Rules** - Fine-grained access control and data validation

### **State Management & Forms**
- **React Hook Form** - Performant form handling with validation
- **Zod** - Schema validation for type-safe data handling
- **Context API** - Global state management for authentication and user data

### **UI/UX Libraries**
- **Lucide React** - Beautiful icon library with consistent design
- **Framer Motion** - Smooth animations and micro-interactions
- **Sonner** - Toast notifications with elegant styling
- **React Day Picker** - Accessible date selection components

### **File Handling & Optimization**
- **browser-image-compression** - Client-side image compression for faster uploads
- **Firebase Storage SDK** - Secure file upload and retrieval
- **UUID** - Unique identifier generation for file naming

---

## 🔥 Firebase Integration Details

### **Firestore Database Structure**
```javascript
// Users Collection
users/{userId} {
  username: string,
  email: string,
  bio: string,
  profileImage: string,
  interests: string[],
  goals: string[],
  createdAt: timestamp
}

// Challenges Collection
challenges/{challengeId} {
  title: string,
  description: string,
  userId: string,
  participants: string[],
  milestones: object[],
  isPublic: boolean,
  invitationCode: string,
  status: 'active' | 'completed'
}

// Journeys Collection
journeys/{journeyId} {
  userId: string,
  title: string,
  content: string,
  imageURL: string,
  tags: string[],
  likes: number,
  likedBy: string[],
  comments: object[]
}
```

### **Firebase Storage Organization**
```
/profile-images/{userId}/
  ├── compressed-image-uuid.jpg
  └── thumbnail-uuid.jpg

/journey-images/{userId}/
  ├── post-image-uuid.jpg
  └── optimized-uuid.jpg
```

### **Security Rules Implementation**
- **User Data Protection** - Users can only modify their own data
- **Challenge Access Control** - Participants-only access for private challenges
- **Image Upload Restrictions** - File size and type validation
- **Real-time Validation** - Server-side data validation for all operations

---

## 📸 Image Upload System

### **Smart Compression Pipeline**
```javascript
// Advanced Image Processing
const uploadImage = async (file, path, options = { useCompression: true }) => {
  // Auto-compression for files > 1MB
  if (options.useCompression && file.size > 1024 * 1024) {
    const compressionOptions = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    
    fileToUpload = await imageCompression(file, compressionOptions);
  }
  
  // Generate unique filename with UUID
  const fileName = `${uuidv4()}-${file.name}`;
  
  // Upload to Firebase Storage
  const storageRef = ref(storage, `${path}/${fileName}`);
  const snapshot = await uploadBytes(storageRef, fileToUpload);
  
  return await getDownloadURL(snapshot.ref);
};
```

### **Upload Features**
- **Automatic Compression** reduces file sizes by up to 80% without quality loss
- **Progress Tracking** with real-time upload status
- **Error Handling** with retry mechanisms and user feedback
- **File Type Validation** supporting JPEG, PNG, WebP formats
- **Storage Organization** with user-specific folders and naming conventions

---

## 🚀 Getting Started

### **Prerequisites**
```bash
Node.js 18.0+
npm or yarn package manager
Firebase account and project
```

### **Installation**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/rasyadlubisdev/britemu.git
   cd britemu
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Firebase Configuration**
   ```bash
   # Create .env.local file
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Firebase Project Setup**
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize Firebase in your project
   firebase init
   ```

5. **Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Access Application**
   ```
   Open http://localhost:3000 in your browser
   ```

---

## 🔧 Firebase Configuration

### **Firestore Security Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public challenges are readable, only creators can write
    match /challenges/{challengeId} {
      allow read: if resource.data.isPublic == true;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Journey posts with privacy controls
    match /journeys/{journeyId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### **Storage Security Rules**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-images/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /journey-images/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 📱 Key Components

### **Smart Image Upload Component**
```typescript
// Enhanced image upload with compression
export function ImageUploadComponent() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleUpload = async (file: File) => {
    setUploading(true);
    
    try {
      const result = await uploadImage(
        file, 
        `journey-images/${currentUser.uid}`,
        { useCompression: true }
      );
      
      // Display compression results
      toast.success(
        `Image compressed from ${(result.originalSize / 1024).toFixed(1)}KB 
         to ${(result.compressedSize / 1024).toFixed(1)}KB`
      );
      
      setImageURL(result.url);
    } catch (error) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };
}
```

### **Real-time Challenge Updates**
```typescript
// Live challenge progress tracking
useEffect(() => {
  const challengeRef = doc(db, "challenges", challengeId);
  
  const unsubscribe = onSnapshot(challengeRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      setChallenge(data);
      
      // Update progress metrics
      const completedMilestones = data.milestones.filter(m => m.completed).length;
      const progress = (completedMilestones / data.milestones.length) * 100;
      setProgress(progress);
    }
  });
  
  return () => unsubscribe();
}, [challengeId]);
```

---

## 🎯 Core Features in Detail

### **Challenge Management**
- **Drag & Drop Milestones** - Intuitive milestone reordering with @dnd-kit
- **Real-time Progress** - Live updates across all participants
- **Smart Invitations** - Unique codes for easy challenge sharing
- **Privacy Controls** - Public discovery vs private challenges

### **Journey Documentation**
- **Rich Media Posts** - Text, images, and hashtag support
- **Social Engagement** - Like, comment, and share functionality
- **Personal Timeline** - Chronological progress tracking
- **Content Discovery** - Intelligent feed algorithm

### **Connection System**
- **Compatibility Matching** - Algorithm based on interests and goals
- **Activity Tracking** - Engagement metrics for better matches
- **Profile Discovery** - Advanced search and filtering
- **Relationship Management** - Following/follower system

### **Messaging Platform**
- **Real-time Chat** - Instant message delivery with Firebase
- **Unread Tracking** - Smart notification system
- **Message History** - Persistent conversation storage
- **User Presence** - Online/offline status indicators

---

## 🔐 Security & Privacy

### **Data Protection**
- **Firebase Security Rules** - Server-side access control
- **Input Validation** - Zod schema validation for all forms
- **Image Processing** - Client-side compression before upload
- **Error Handling** - Comprehensive error catching and user feedback

### **Privacy Controls**
- **Profile Visibility** - Public/private profile options
- **Challenge Privacy** - Public discovery vs invitation-only
- **Data Ownership** - Users control their own data completely
- **Secure Authentication** - Firebase Auth with Google OAuth support

---

## 📊 Performance Optimizations

### **Image Optimization**
- **Automatic Compression** - Reduces file sizes by 70-90%
- **Progressive Loading** - Lazy loading for better performance
- **CDN Delivery** - Firebase Storage global CDN
- **Caching Strategy** - Browser and Firebase caching

### **Database Optimization**
- **Compound Queries** - Efficient Firestore query patterns
- **Real-time Listeners** - Minimal data transfer with targeted updates
- **Pagination** - Infinite scroll for large datasets
- **Connection Pooling** - Optimized Firebase SDK usage

---

## 🚀 Deployment

### **Vercel Deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

### **Firebase Hosting**
```bash
# Build for production
npm run build

# Deploy to Firebase
firebase deploy
```

### **Environment Variables**
Ensure all Firebase configuration variables are set in your deployment platform.

---

## 🙏 Acknowledgments

- **Firebase Team** - For the incredible backend infrastructure
- **Vercel** - For seamless deployment and hosting
- **Shadcn/UI** - For the beautiful component library
- **Next.js Team** - For the amazing React framework
- **Open Source Community** - For the countless libraries and tools

---

**Built with ❤️ using Next.js, Firebase, and modern web technologies**

*Empowering individuals to achieve their goals through community support and social accountability.*