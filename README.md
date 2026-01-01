# Lox Monorepo

Rocketbook replacement monorepo with React Native mobile app and Fastify API server.

## Structure

```
.
├── apps/
│   ├── mobile-app/     # React Native app (Expo)
│   └── api-server/     # Fastify API server
├── packages/           # Shared packages (future)
├── pnpm-workspace.yaml
└── package.json
```

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- For mobile development:
  - iOS: Xcode (macOS only)
  - Android: Android Studio

## Setup

1. Install pnpm globally (if not already installed):
   ```bash
   npm install -g pnpm
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

## Development

### API Server

Start the Fastify API server in development mode:

```bash
pnpm dev:api
```

The API will be available at `http://localhost:3000`

- Health check: `GET /health`
- Example endpoint: `GET /api/hello`

### Mobile App

Start the React Native/Expo development server:

```bash
pnpm dev:mobile
```

Then:
- Press `i` to open iOS simulator (macOS only)
- Press `a` to open Android emulator
- Press `w` to open in web browser
- Scan QR code with Expo Go app on your device

## Available Scripts

### Root Level

- `pnpm dev:mobile` - Start mobile app development server
- `pnpm dev:api` - Start API server in development mode
- `pnpm build` - Build all packages
- `pnpm type-check` - Type check all packages
- `pnpm lint` - Lint all packages

### API Server (`apps/api-server`)

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build TypeScript to JavaScript
- `pnpm start` - Start production server
- `pnpm type-check` - Type check without emitting files

### Mobile App (`apps/mobile-app`)

- `pnpm start` - Start Expo development server
- `pnpm android` - Start Android emulator
- `pnpm ios` - Start iOS simulator (macOS only)
- `pnpm web` - Start web version
- `pnpm build` - Build for production
- `pnpm type-check` - Type check without emitting files

## Environment Variables

### API Server

Create `apps/api-server/.env` from `.env.example`:

```bash
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
```

## Tech Stack

- **Monorepo**: pnpm workspaces
- **Language**: TypeScript
- **Mobile**: React Native with Expo
- **API**: Fastify
- **Package Manager**: pnpm

## Project Structure Details

### Mobile App (`apps/mobile-app`)

Built with Expo Router for file-based routing. The app structure follows Expo conventions:
- `app/` - Routes and screens
- `assets/` - Images, fonts, etc.

### API Server (`apps/api-server`)

Fastify-based API server with TypeScript:
- `src/` - Source code
- `dist/` - Compiled output (generated)

## Next Steps

1. Add shared packages in `packages/` for code reuse
2. Set up environment-specific configurations
3. Add testing framework (Jest/Vitest)
4. Configure CI/CD pipeline
5. Add database integration to API server
6. Implement authentication
