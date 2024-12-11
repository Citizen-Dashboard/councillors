# Civic Dashboard: Councillors

## Setup

To get started running locally, create a `.env` file with the following:

```
POSTGRES_URL="postgresql://default:MyLocalPsqlPassword@localhost:56789/cdlocal?sslmode=require"
POSTGRES_PRISMA_URL="postgresql://default:MyLocalPsqlPassword@localhost:56789/cdlocal?sslmode=require&pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NO_SSL="postgresql://default:MyLocalPsqlPassword@localhost:56789/cdlocal"
POSTGRES_URL_NON_POOLING="postgresql://default:MyLocalPsqlPassword@localhost:56789/cdlocal?sslmode=require"
POSTGRES_USER="default"
POSTGRES_HOST="localhost"
POSTGRES_PASSWORD="MyLocalPsqlPassword"
POSTGRES_DATABASE="cdlocal"
DEVELOPMENT_NEON_PORT="54330"
VERCEL_ENV="development"
```

Then locally run:

- `npm install --legacy-peer-deps`
  - Installs the project depdencies
- `docker-compose up`
  - Boots the local PSQL server and proxy
- `npm run script:dbTest`
  - Checks that we are able to make a connection to the local PSQL server
- `npm run script:dbSetup`
  - Creates tables and views and populates them with data from the Toronto open data API
- `npm run dev`
  - Boots the next development server locally

Optionally, you can connect to a hosted Vercel Postgres DB.
To do this, provision the instance in their web portal, replace the env vars with the ones provided by Vercel, and skip the `docker-compose up` step.
