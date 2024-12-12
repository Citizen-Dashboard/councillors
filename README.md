# Civic Dashboard: Councillors

## Setup

First setup the application and datebase with:

- `npm run setup:local`

  - Installs the project depdencies
  - Boots the local PSQL server and proxy
  - Creates tables and views and populates them with data from the Toronto open data API

- `npm run script:dbTest`

  - Checks that we are able to make a connection to the local PSQL server

- `npm run dev`
  - Boots the next development server locally

Optionally, you can connect to a hosted Vercel Postgres DB.
To do this, provision the instance in their web portal, replace the env vars with the ones provided by Vercel, and skip the `docker-compose up` step.
