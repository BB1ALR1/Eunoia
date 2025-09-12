// Type augmentation for Express Request to include `user`
export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
        email: string;
      };
    }
  }
}

