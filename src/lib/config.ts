export const config = {
  POSTGRES_URL: process.env.POSTGRES_URL!,
  POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL!,
  POSTGRES_URL_NO_SSL: process.env.POSTGRES_URL_NO_SSL!,
  POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING!,
  POSTGRES_USER: process.env.POSTGRES_USER!,
  POSTGRES_HOST: process.env.POSTGRES_HOST!,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD!,
  POSTGRES_DATABASE: process.env.POSTGRES_DATABASE!,
};

const missingEnvVars = Object.entries(config)
  .filter(([, value]) => !value)
  .map(([key]) => key);
if (missingEnvVars.length > 0)
  throw new Error(`Missing env vars ${missingEnvVars}`);
