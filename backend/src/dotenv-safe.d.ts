declare module 'dotenv-safe' {
  export function config(options?: {
    allowEmptyValues?: boolean;
    example?: string;
    path?: string;
  }): void;
}