import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Check if user exists in Firestore
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.role === 'admin' || currentUser.email === 'jefferson10444@gmail.com');
          } else {
            // Create user document if it doesn't exist
            const isDefaultAdmin = currentUser.email === 'jefferson10444@gmail.com';
            await setDoc(userDocRef, {
              email: currentUser.email,
              role: isDefaultAdmin ? 'admin' : 'customer',
              createdAt: new Date()
            });
            setIsAdmin(isDefaultAdmin);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          // Fallback to email check for default admin
          setIsAdmin(currentUser.email === 'jefferson10444@gmail.com');
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const signupWithEmail = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        email: userCredential.user.email,
        name: name,
        role: email === 'jefferson10444@gmail.com' ? 'admin' : 'customer',
        createdAt: new Date()
      });
      
      return { success: true, message: 'Signup successful! Please check your email to verify your account.' };
    } catch (error: any) {
      console.error("Error signing up:", error);
      return { success: false, error: error.message };
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified && email !== 'jefferson10444@gmail.com') {
        await signOut(auth);
        return { 
          success: false, 
          error: 'Please verify your email before signing in. Check your spam folder if you cannot find the verification email in your inbox.' 
        };
      }
      
      return { success: true };
    } catch (error: any) {
      console.error("Error logging in:", error);
      return { success: false, error: error.message };
    }
  };

  return { user, isAdmin, loading, login, logout, signupWithEmail, loginWithEmail };
}
