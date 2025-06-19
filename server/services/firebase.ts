import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import { getStorage } from 'firebase-admin/storage';

// Check if we have actual Firebase credentials
const hasCredentials = process.env.FIREBASE_PRIVATE_KEY && 
                      process.env.FIREBASE_CLIENT_EMAIL && 
                      process.env.FIREBASE_PROJECT_ID;

let firestore: any = null;
let realtimeDb: any = null;
let storage: any = null;

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    if (getApps().length === 0 && hasCredentials) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
      };

      initializeApp({
        credential: cert(serviceAccount as any),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
      
      firestore = getFirestore();
      realtimeDb = getDatabase();
      storage = getStorage();
      console.log('Firebase Admin SDK initialized with credentials');
    } else {
      console.log('No Firebase credentials found - running in demo mode');
      // Create mock Firebase services for demo
      firestore = null;
      realtimeDb = null;
      storage = null;
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    console.log('Continuing in demo mode without Firebase');
    firestore = null;
    realtimeDb = null;
    storage = null;
  }
};

// Initialize Firebase
initializeFirebase();

// Export Firebase services (may be null in demo mode)
export { firestore, realtimeDb, storage };

// Firebase service functions
export class FirebaseService {
  // Student verification in Firestore
  static async verifyStudent(userId: string, email: string, status: 'approved' | 'rejected', notes?: string) {
    try {
      if (firestore) {
        const verificationRef = firestore.collection('verifications').doc(userId);
        await verificationRef.set({
          email,
          status,
          notes: notes || '',
          verifiedAt: new Date(),
          verifiedBy: 'admin'
        });
        
        // Update user status in Firestore
        const userRef = firestore.collection('users').doc(userId);
        await userRef.update({
          verified: status === 'approved',
          verificationStatus: status,
          updatedAt: new Date()
        });
        
        console.log(`Firebase: Student ${userId} verification ${status}`);
      } else {
        console.log(`Demo mode: Student ${userId} verification ${status} (would be saved to Firebase)`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Firebase verification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Post moderation in Firestore
  static async moderatePost(postId: string, action: 'approve' | 'reject', reason?: string) {
    try {
      if (firestore) {
        const postRef = firestore.collection('posts').doc(postId);
        await postRef.update({
          moderationStatus: action === 'approve' ? 'approved' : 'rejected',
          moderatedAt: new Date(),
          moderatedBy: 'admin',
          moderationReason: reason || ''
        });

        // Log moderation action
        await firestore.collection('moderationLogs').add({
          postId,
          action,
          reason: reason || '',
          moderatorId: 'admin',
          createdAt: new Date()
        });

        console.log(`Firebase: Post ${postId} ${action}d`);
      } else {
        console.log(`Demo mode: Post ${postId} ${action}d (would be saved to Firebase)`);
      }

      return { success: true };
    } catch (error) {
      console.error('Firebase moderation error:', error);
      return { success: false, error: error.message };
    }
  }

  // ID verification file upload
  static async uploadIdDocument(userId: string, fileBuffer: Buffer, filename: string) {
    try {
      if (storage && firestore) {
        const bucket = storage.bucket();
        const file = bucket.file(`id-documents/${userId}/${filename}`);
        
        await file.save(fileBuffer, {
          metadata: {
            contentType: 'image/jpeg'
          }
        });

        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Update user record with ID URL
        await firestore.collection('users').doc(userId).update({
          idUploaded: true,
          idUrl: url,
          updatedAt: new Date()
        });

        console.log(`Firebase: ID document uploaded for user ${userId}`);
        return { success: true, url };
      } else {
        const mockUrl = `https://storage.googleapis.com/campusbuzz-project.appspot.com/id-documents/${userId}/${filename}`;
        console.log(`Demo mode: ID document upload simulated for user ${userId}`);
        return { success: true, url: mockUrl };
      }
    } catch (error) {
      console.error('Firebase ID upload error:', error);
      return { success: false, error: error.message };
    }
  }

  // Chat monitoring via Realtime Database
  static async monitorChat(chatId: string) {
    try {
      if (realtimeDb) {
        const chatRef = realtimeDb.ref(`chats/${chatId}`);
        const snapshot = await chatRef.once('value');
        return snapshot.val();
      } else {
        console.log(`Demo mode: Chat monitoring for ${chatId}`);
        return {
          messages: [
            { id: 1, text: "Demo chat message", timestamp: new Date(), userId: "user1" }
          ],
          participants: ["user1", "user2"]
        };
      }
    } catch (error) {
      console.error('Firebase chat monitoring error:', error);
      return { messages: [], participants: [] };
    }
  }

  // Get pending verifications from Firestore
  static async getPendingVerifications() {
    try {
      if (firestore) {
        const snapshot = await firestore.collection('verifications')
          .where('status', '==', 'pending')
          .orderBy('createdAt', 'desc')
          .limit(50)
          .get();
          
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      } else {
        console.log('Demo mode: Using local verification data');
        return [];
      }
    } catch (error) {
      console.error('Firebase get pending verifications error:', error);
      return [];
    }
  }

  // Get flagged posts from Firestore
  static async getFlaggedPosts() {
    try {
      if (firestore) {
        const snapshot = await firestore.collection('posts')
          .where('moderationStatus', '==', 'flagged')
          .orderBy('createdAt', 'desc')
          .limit(50)
          .get();
          
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      } else {
        console.log('Demo mode: Using local posts data');
        return [];
      }
    } catch (error) {
      console.error('Firebase get flagged posts error:', error);
      return [];
    }
  }

  // Update system stats in Firestore
  static async updateSystemStats(stats: any) {
    try {
      if (firestore) {
        await firestore.collection('systemStats').doc('current').set({
          ...stats,
          updatedAt: new Date()
        });
        console.log('Firebase: System stats updated');
      } else {
        console.log('Demo mode: System stats update simulated');
      }
      return { success: true };
    } catch (error) {
      console.error('Firebase update stats error:', error);
      return { success: false, error: error.message };
    }
  }
}
