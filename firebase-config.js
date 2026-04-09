// 1) Paste your Firebase project config below.
// 2) Ensure Authentication (Anonymous) and Firestore are enabled in console.
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyA4aHhoMxUxdslRSkIeaQcIs1F-BXf-SXA",
  authDomain: "volleyball-app-ed985.firebaseapp.com",
  projectId: "volleyball-app-ed985",
  storageBucket: "volleyball-app-ed985.firebasestorage.app",
  messagingSenderId: "16683711958",
  appId: "1:16683711958:web:247b8def86601e0e677877",
  measurementId: "G-T6H9PE1H5M"
};

window.FirebaseAppReady = (async () => {
  try {
    firebase.initializeApp(window.FIREBASE_CONFIG);
  } catch (_e) {
    // Ignore duplicate initialize during hot reload.
  }

  try {
    await firebase.auth().signInAnonymously();
  } catch (error) {
    console.error("Firebase anonymous sign-in failed:", error);
  }
})();
