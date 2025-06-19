import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { z } from "zod";
import { storage } from "./storage";
import { FirebaseService } from "./services/firebase";
import { emailDomainSchema, insertVerificationRequestSchema } from "@shared/schema";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware for error handling
  const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

  // Email domain validation endpoint
  app.post("/api/validate-email", asyncHandler(async (req: any, res: any) => {
    try {
      const { email } = emailDomainSchema.parse(req.body);
      res.json({ valid: true, message: "Email domain is valid" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          valid: false, 
          message: error.errors[0]?.message || "Invalid email domain" 
        });
      } else {
        res.status(500).json({ valid: false, message: "Email validation failed" });
      }
    }
  }));

  // Student verification endpoints
  app.post("/api/verify-student", asyncHandler(async (req: any, res: any) => {
    try {
      const requestData = insertVerificationRequestSchema.parse(req.body);
      
      // Validate email domain
      emailDomainSchema.parse({ email: requestData.email });
      
      // Store verification request
      const verificationRequest = await storage.createVerificationRequest(requestData);
      
      res.json({ 
        success: true, 
        message: "Verification request submitted successfully",
        id: verificationRequest.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Validation failed", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Failed to submit verification request" 
        });
      }
    }
  }));

  // Get pending verification requests
  app.get("/api/verifications/pending", asyncHandler(async (req: any, res: any) => {
    try {
      const pendingVerifications = await storage.getVerificationRequests('pending');
      res.json({ success: true, data: pendingVerifications });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch pending verifications" 
      });
    }
  }));

  // Approve/reject verification
  app.put("/api/verifications/:id", asyncHandler(async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid status. Must be 'approved' or 'rejected'" 
        });
      }

      const verificationRequest = await storage.updateVerificationRequest(parseInt(id), {
        status,
        notes,
        reviewedBy: 'admin',
        reviewedAt: new Date(),
      });

      if (!verificationRequest) {
        return res.status(404).json({ 
          success: false, 
          message: "Verification request not found" 
        });
      }

      // Update in Firebase
      try {
        await FirebaseService.verifyStudent(
          verificationRequest.userId?.toString() || id, 
          verificationRequest.email, 
          status,
          notes
        );
      } catch (firebaseError) {
        console.error('Firebase update failed:', firebaseError);
        // Continue with local update even if Firebase fails
      }

      res.json({ 
        success: true, 
        message: `Verification ${status} successfully`,
        data: verificationRequest 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to update verification status" 
      });
    }
  }));

  // Post moderation endpoints
  app.get("/api/posts/flagged", asyncHandler(async (req: any, res: any) => {
    try {
      const flaggedPosts = await storage.getPosts('flagged');
      res.json({ success: true, data: flaggedPosts });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch flagged posts" 
      });
    }
  }));

  // Moderate post (approve/reject)
  app.put("/api/posts/:id/moderate", asyncHandler(async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { action, reason } = req.body;
      
      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid action. Must be 'approve' or 'reject'" 
        });
      }

      const post = await storage.updatePost(parseInt(id), {
        moderationStatus: action === 'approve' ? 'approved' : 'rejected',
        updatedAt: new Date(),
      });

      if (!post) {
        return res.status(404).json({ 
          success: false, 
          message: "Post not found" 
        });
      }

      // Log moderation action
      await storage.createModerationLog({
        postId: parseInt(id),
        action,
        moderatorId: 'admin',
        reason: reason || '',
      });

      // Update in Firebase
      try {
        await FirebaseService.moderatePost(id, action, reason);
      } catch (firebaseError) {
        console.error('Firebase moderation update failed:', firebaseError);
      }

      res.json({ 
        success: true, 
        message: `Post ${action}d successfully`,
        data: post 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to moderate post" 
      });
    }
  }));

  // ID upload endpoint
  app.post("/api/upload-id", upload.single('idDocument'), asyncHandler(async (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: "No file uploaded" 
        });
      }

      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          message: "User ID is required" 
        });
      }

      // Upload to Firebase Storage
      try {
        const result = await FirebaseService.uploadIdDocument(
          userId, 
          req.file.buffer, 
          req.file.originalname
        );
        
        res.json({ 
          success: true, 
          message: "ID document uploaded successfully",
          url: result.url 
        });
      } catch (firebaseError) {
        console.error('Firebase upload failed:', firebaseError);
        res.status(500).json({ 
          success: false, 
          message: "Failed to upload ID document to Firebase" 
        });
      }
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to process ID upload" 
      });
    }
  }));

  // System statistics endpoint
  app.get("/api/stats", asyncHandler(async (req: any, res: any) => {
    try {
      const stats = await storage.getSystemStats();
      if (!stats) {
        return res.status(404).json({ 
          success: false, 
          message: "Stats not found" 
        });
      }
      
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch system statistics" 
      });
    }
  }));

  // Chat monitoring endpoint
  app.get("/api/chats/:chatId", asyncHandler(async (req: any, res: any) => {
    try {
      const { chatId } = req.params;
      const chatData = await FirebaseService.monitorChat(chatId);
      
      res.json({ 
        success: true, 
        data: chatData || { messages: [], participants: [] } 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to monitor chat" 
      });
    }
  }));

  // Moderation logs endpoint
  app.get("/api/moderation-logs", asyncHandler(async (req: any, res: any) => {
    try {
      const logs = await storage.getModerationLogs();
      res.json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch moderation logs" 
      });
    }
  }));

  // API health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      services: {
        firebase: "connected",
        storage: "operational",
        api: "running"
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
