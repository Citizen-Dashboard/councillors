# Citizen Dashboard: Councillors

## Setup

Provision a Vercel postgres database, or [run a local container of ](https://vercel.com/docs/storage/vercel-postgres/local-development#option-2:-local-postgres-instance-with-docker).

Create a .env with the following:

```
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NO_SSL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=
```

Then locally run

- `npm install`
  - Installs the project depdencies
- `npm run script:dbsetup`
  - Creates tables and views and populates them with data from the Toronto open data API
- `npm run dev`
  - Boots the next development server locally
