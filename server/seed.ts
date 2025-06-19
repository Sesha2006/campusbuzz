import { db } from "./db";
import { users, posts, verificationRequests, moderationLogs, systemStats } from "@shared/schema";

export async function seedDatabase() {
  try {
    console.log("Seeding database with sample data...");

    // Create sample users
    const sampleUsers = await db.insert(users).values([
      {
        email: "john.doe@stanford.edu",
        username: "johndoe",
        fullName: "John Doe",
        college: "Stanford University",
        verified: true,
        verificationStatus: "approved",
        idUploaded: true,
        idUrl: "https://example.com/id1.jpg"
      },
      {
        email: "sarah.smith@mit.edu",
        username: "sarahsmith",
        fullName: "Sarah Smith",
        college: "MIT",
        verified: false,
        verificationStatus: "pending",
        idUploaded: true,
        idUrl: "https://example.com/id2.jpg"
      },
      {
        email: "mike.johnson@harvard.edu",
        username: "mikej",
        fullName: "Mike Johnson",
        college: "Harvard University",
        verified: true,
        verificationStatus: "approved",
        idUploaded: true,
        idUrl: "https://example.com/id3.jpg"
      },
      {
        email: "alice.wong@berkeley.edu",
        username: "alicew",
        fullName: "Alice Wong",
        college: "UC Berkeley",
        verified: false,
        verificationStatus: "rejected",
        idUploaded: true,
        idUrl: "https://example.com/id4.jpg"
      },
      {
        email: "raj.patel@iitm.ac.in",
        username: "rajpatel",
        fullName: "Raj Patel",
        college: "IIT Madras",
        verified: false,
        verificationStatus: "pending",
        idUploaded: false,
        idUrl: null
      }
    ]).returning();

    // Create sample posts
    await db.insert(posts).values([
      {
        content: "Hey everyone! Just wanted to share my experience with the new campus library study rooms. They're amazing!",
        userId: sampleUsers[0].id,
        moderationStatus: "approved",
        priority: "low"
      },
      {
        content: "This post contains inappropriate language and should be flagged for review by moderators.",
        userId: sampleUsers[1].id,
        moderationStatus: "flagged",
        flaggedBy: ["system", "user123"],
        flagReason: "Inappropriate content detected",
        priority: "high"
      },
      {
        content: "Looking for study partners for the upcoming finals. Anyone interested in forming a study group?",
        userId: sampleUsers[2].id,
        moderationStatus: "approved",
        priority: "low"
      },
      {
        content: "Spam post with promotional content that violates community guidelines.",
        userId: sampleUsers[3].id,
        moderationStatus: "flagged",
        flaggedBy: ["moderator1"],
        flagReason: "Promotional spam",
        priority: "medium"
      },
      {
        content: "Campus food review: The new cafeteria menu is actually pretty good! Tried the Mediterranean bowl today.",
        userId: sampleUsers[4].id,
        moderationStatus: "pending",
        priority: "low"
      }
    ]);

    // Create sample verification requests
    await db.insert(verificationRequests).values([
      {
        email: "sarah.smith@mit.edu",
        fullName: "Sarah Smith",
        college: "MIT",
        status: "pending",
        userId: sampleUsers[1].id,
        notes: "Student ID document uploaded for verification"
      },
      {
        email: "raj.patel@iitm.ac.in",
        fullName: "Raj Patel",
        college: "IIT Madras",
        status: "pending",
        userId: sampleUsers[4].id,
        notes: "Awaiting document upload"
      },
      {
        email: "alice.wong@berkeley.edu",
        fullName: "Alice Wong",
        college: "UC Berkeley",
        status: "rejected",
        userId: sampleUsers[3].id,
        reviewedBy: "admin@campusbuzz.com",
        reviewedAt: new Date(),
        notes: "Document quality insufficient for verification"
      }
    ]);

    // Create sample moderation logs
    await db.insert(moderationLogs).values([
      {
        action: "approve_post",
        moderatorId: "admin@campusbuzz.com",
        reason: "Content meets community guidelines",
        postId: 1
      },
      {
        action: "flag_post",
        moderatorId: "system",
        reason: "Automated content filter detected inappropriate language",
        postId: 2
      },
      {
        action: "verify_student",
        moderatorId: "admin@campusbuzz.com",
        reason: "Student verification approved - valid .edu email and ID document"
      },
      {
        action: "reject_verification",
        moderatorId: "admin@campusbuzz.com",
        reason: "Document quality insufficient for verification process"
      }
    ]);

    // Create system stats
    await db.insert(systemStats).values({
      totalUsers: 1247,
      pendingVerifications: 23,
      activeChats: 156,
      apiRequests: 8934
    });

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}