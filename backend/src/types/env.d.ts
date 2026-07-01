declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    PORT?: string
    MONGODB_URI: string
    REDIS_URL: string
    JWT_SECRET: string
    JWT_EXPIRES_IN?: string
    GEMINI_API_KEY: string
    GROQ_API_KEY: string
    CLIENT_URL?: string
  }
}
