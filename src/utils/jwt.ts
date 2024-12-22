import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (payload: object): string => {
  const sessionId = Math.random().toString(36).substr(2); // Generate unique session ID
  return jwt.sign({ ...payload, sessionId }, process.env.JWT_SECRET as string, {
    expiresIn: '1h',
  });
};

export const verifyToken = (token: string): object | null => {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        if (typeof decoded === 'object' && decoded !== null) {
            return decoded;
        }
        return null;
    } catch (error) {
        return null;
    }
};
