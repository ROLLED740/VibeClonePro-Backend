# VibeClonePro Backend

This is the backend for VibeClonePro, a high-fidelity SaaS tool.

## Tech Stack
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Real-time**: Socket.io (WebSockets)
- **Encryption**: AES-256 (for Vault)

## API Structure

- **User**: `/users` (Create user, Get user)
- **Vault**: `/vault` (Store secret, Get encrypted secret, Reveal secret)
- **Telemetry**: WebSocket gateway for real-time updates.

## Getting Started

### 1. Start the Database
Ensure Docker is running, then:
```bash
docker-compose up -d db
```

### 2. Configure Environment
Check `.env` file for database credentials (`postgres`/`password`/`vibeclonepro`).

### 3. Run the Application
```bash
npm install
npm run start:dev
```

### 4. API Endpoints
- **POST** `/users`: `{ "email": "test@example.com", "password": "password" }`
- **POST** `/vault`: `{ "name": "API Key", "content": "sk-12345", "ownerId": "uuid-of-user" }`
- **GET** `/vault/:id/reveal`: Returns decrypted content.

