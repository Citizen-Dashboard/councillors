# Civic Dashboard: Councillors

## Setup

First setup the application and datebase with:

- `npm run setup:local`

  - Installs the project depdencies
  - Boots the local PSQL server and proxy
  - Creates tables and views and populates them with data from the Toronto open data API

If you would like to check the health of the database you can run:

- `npm run script:dbTest`

  - Checks that we are able to make a connection to the local PSQL server

Then you can start the next.js application with:

- `npm run dev`

  - Boots the next development server locally

Optionally, you can connect to a hosted Vercel Postgres DB.
To do this, provision the instance in their web portal, create a .env based on the .env.example and replace the env vars with the ones provided by Vercel.
