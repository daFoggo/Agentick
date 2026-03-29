/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly DATABASE_URL: string;
      readonly OPEN_AI_API_KEY: string;
      readonly SELINE_TOKEN: string;
      readonly NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

export {};
