import { 
  users, posts, verificationRequests, moderationLogs, systemStats,
  type User, type InsertUser, type Post, type InsertPost, 
  type VerificationRequest, type InsertVerificationRequest,
  type ModerationLog, type InsertModerationLog, type SystemStats
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Verification operations
  createVerificationRequest(request: InsertVerificationRequest): Promise<VerificationRequest>;
  getVerificationRequests(status?: 'pending' | 'approved' | 'rejected'): Promise<VerificationRequest[]>;
  updateVerificationRequest(id: number, updates: Partial<VerificationRequest>): Promise<VerificationRequest | undefined>;
  
  // Post operations
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined>;
  getPosts(status?: 'pending' | 'approved' | 'rejected' | 'flagged'): Promise<Post[]>;
  
  // Moderation operations
  createModerationLog(log: InsertModerationLog): Promise<ModerationLog>;
  getModerationLogs(): Promise<ModerationLog[]>;
  
  // System stats
  getSystemStats(): Promise<SystemStats | undefined>;
  updateSystemStats(stats: Partial<SystemStats>): Promise<SystemStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private verificationRequests: Map<number, VerificationRequest>;
  private moderationLogs: Map<number, ModerationLog>;
  private systemStats: SystemStats | undefined;
  private currentUserId: number;
  private currentPostId: number;
  private currentVerificationId: number;
  private currentLogId: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.verificationRequests = new Map();
    this.moderationLogs = new Map();
    this.currentUserId = 1;
    this.currentPostId = 1;
    this.currentVerificationId = 1;
    this.currentLogId = 1;
    
    // Initialize system stats
    this.systemStats = {
      id: 1,
      totalUsers: 2847,
      pendingVerifications: 43,
      activeChats: 186,
      apiRequests: 12400,
      updatedAt: new Date(),
    };
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample verification requests
    const verificationRequests = [
      {
        userId: 1,
        email: "sarah.j@stanford.edu",
        fullName: "Sarah Johnson",
        college: "Stanford University",
        status: 'pending' as const,
        reviewedBy: null,
        reviewedAt: null,
        notes: null,
        createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      },
      {
        userId: 2,
        email: "mchen@mit.edu",
        fullName: "Michael Chen",
        college: "MIT",
        status: 'pending' as const,
        reviewedBy: null,
        reviewedAt: null,
        notes: null,
        createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      },
      {
        userId: 3,
        email: "priya@iitm.ac.in",
        fullName: "Priya Sharma",
        college: "IIT Madras",
        status: 'pending' as const,
        reviewedBy: null,
        reviewedAt: null,
        notes: null,
        createdAt: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
      },
    ];

    verificationRequests.forEach(req => {
      const id = this.currentVerificationId++;
      this.verificationRequests.set(id, { ...req, id });
    });

    // Sample flagged posts
    const flaggedPosts = [
      {
        userId: 4,
        content: "Post contains inappropriate language and was flagged by multiple users. Content discusses exam cheating methods...",
        moderationStatus: 'flagged' as const,
        flaggedBy: ["user123", "user456", "user789"],
        flagReason: "Inappropriate content and academic dishonesty",
        priority: 'high' as const,
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        updatedAt: new Date(Date.now() - 10 * 60 * 1000),
      },
      {
        userId: 5,
        content: "Spam detection: User posted the same content multiple times across different forums...",
        moderationStatus: 'flagged' as const,
        flaggedBy: ["user101"],
        flagReason: "Spam",
        priority: 'medium' as const,
        createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
        updatedAt: new Date(Date.now() - 25 * 60 * 1000),
      },
    ];

    flaggedPosts.forEach(post => {
      const id = this.currentPostId++;
      this.posts.set(id, { ...post, id });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createVerificationRequest(insertRequest: InsertVerificationRequest): Promise<VerificationRequest> {
    const id = this.currentVerificationId++;
    const request: VerificationRequest = {
      ...insertRequest,
      id,
      createdAt: new Date(),
    };
    this.verificationRequests.set(id, request);
    return request;
  }

  async getVerificationRequests(status?: 'pending' | 'approved' | 'rejected'): Promise<VerificationRequest[]> {
    const requests = Array.from(this.verificationRequests.values());
    if (status) {
      return requests.filter(req => req.status === status);
    }
    return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateVerificationRequest(id: number, updates: Partial<VerificationRequest>): Promise<VerificationRequest | undefined> {
    const request = this.verificationRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, ...updates };
    this.verificationRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.currentPostId++;
    const post: Post = {
      ...insertPost,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...updates, updatedAt: new Date() };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async getPosts(status?: 'pending' | 'approved' | 'rejected' | 'flagged'): Promise<Post[]> {
    const posts = Array.from(this.posts.values());
    if (status) {
      return posts.filter(post => post.moderationStatus === status);
    }
    return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createModerationLog(insertLog: InsertModerationLog): Promise<ModerationLog> {
    const id = this.currentLogId++;
    const log: ModerationLog = {
      ...insertLog,
      id,
      createdAt: new Date(),
    };
    this.moderationLogs.set(id, log);
    return log;
  }

  async getModerationLogs(): Promise<ModerationLog[]> {
    return Array.from(this.moderationLogs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getSystemStats(): Promise<SystemStats | undefined> {
    return this.systemStats;
  }

  async updateSystemStats(updates: Partial<SystemStats>): Promise<SystemStats> {
    this.systemStats = {
      ...this.systemStats!,
      ...updates,
      updatedAt: new Date(),
    };
    return this.systemStats;
  }
}

export const storage = new MemStorage();
