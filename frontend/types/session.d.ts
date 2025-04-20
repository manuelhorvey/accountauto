// session.d.ts
declare namespace Express {
    export interface Request {
      session: {
        user?: {
          id: string;
          username: string;
          role: string;
        };
      };
    }
  }
  