npm install --legacy-peer-deps
cp .env.example .env
docker compose up -d
npm run script:dbSetup