import dotenv from 'dotenv';
dotenv.config();

const config = {
  app: {
    name: process.env.APP_NAME || 'API',
    version: process.env.APP_VERSION || '1.0.0',
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
    clientOrigin: process.env.CLIENT_ORIGIN || '*',
    swaggerUrl: process.env.SWAGGER_URL || '/api-docs',
    frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, ''),
    companyPhone: process.env.COMPANY_PHONE || '',
    defaultRoleId: parseInt(process.env.DEFAULT_ROLE_ID || '4'),
  },
  db: (() => {
    const env = process.env.NODE_ENV || 'development';
    const prefix = env === 'production' ? 'PROD' : env === 'test' ? 'TEST' : 'DEV';
    return {
      name: process.env[`${prefix}_DB_NAME`] || '',
      user: process.env[`${prefix}_DB_USER`] || '',
      password: process.env[`${prefix}_DB_PASSWORD`] || '',
      host: process.env[`${prefix}_DB_HOST`] || '127.0.0.1',
      port: parseInt(process.env[`${prefix}_DB_PORT`] || '3306'),
      dialect: 'mysql' as const,
      pool: {
        max: parseInt(process.env.DB_POOL_MAX || '10'),
        min: parseInt(process.env.DB_POOL_MIN || '0'),
        acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000'),
        idle: parseInt(process.env.DB_POOL_IDLE || '10000'),
      },
    };
  })(),
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || String(15 * 60 * 1000)),
    max: parseInt(process.env.RATE_LIMIT_MAX || '1000000'),
  },
  cloudflare: {
    endpoint: process.env.CLOUDFLARE_ENDPOINT || '',
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || '',
    bucketName: process.env.CLOUDFLARE_BUCKET_NAME || '',
    publicBaseUrl: process.env.CLOUDFLARE_PUBLIC_BASE_URL || '',
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || '',
    fromName: process.env.EMAIL_FROM_NAME || 'App',
  },
  sms: {
    enabled: process.env.SMS_ENABLED === 'true',
    mockSms: process.env.MOCK_SMS === 'true',
    quicksendEmail: process.env.QUICKSEND_EMAIL || '',
    quicksendApiKey: process.env.QUICKSEND_API_KEY || '',
    quicksendSenderId: process.env.QUICKSEND_SENDER_ID || '',
    quicksendApiUrl: process.env.QUICKSEND_API_URL || 'https://quicksend.lk/Client/api.php',
  },
  payhere: {
    merchantId: process.env.PAYHERE_MERCHANT_ID || '',
    merchantSecret: process.env.PAYHERE_MERCHANT_SECRET || '',
    apiUrl: process.env.PAYHERE_API_URL || 'https://sandbox.payhere.lk',
    notifyUrl: process.env.PAYHERE_NOTIFY_URL || '',
    returnUrl: process.env.PAYHERE_RETURN_URL || '',
    cancelUrl: process.env.PAYHERE_CANCEL_URL || '',
    currency: process.env.PAYHERE_CURRENCY || 'LKR',
    mode: (process.env.PAYHERE_MODE as 'sandbox' | 'live') || 'sandbox',
  },
};

export default config;
