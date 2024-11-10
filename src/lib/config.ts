const mandatoryConfig = {
  POSTGRES_URL: process.env.POSTGRES_URL!,
  POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL!,
  POSTGRES_URL_NO_SSL: process.env.POSTGRES_URL_NO_SSL!,
  POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING!,
  POSTGRES_USER: process.env.POSTGRES_USER!,
  POSTGRES_HOST: process.env.POSTGRES_HOST!,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD!,
  POSTGRES_DATABASE: process.env.POSTGRES_DATABASE!,
  VERCEL_ENV: process.env.VERCEL_ENV!,
};
const optionalConfig = {
  DEVELOPMENT_NEON_PORT: process.env.DEVELOPMENT_NEON_PORT,
};

export const config = {
  ...optionalConfig,
  ...mandatoryConfig,
};

const missingEnvVars = Object.entries(mandatoryConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);
if (missingEnvVars.length > 0)
  throw new Error(`Missing env vars ${missingEnvVars}`);
