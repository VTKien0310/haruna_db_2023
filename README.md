# haruna_db_2023

## Project specification

- Vue 3.3
- Supabase BaaS
- Firebase hosting
- PWA

## System requirement

- Node.js 20
- npm package manager
- Docker

## Project setup for development

### Start local Supabase environment

```sh
npx supabase start --ignore-health-check
```

### Install dependencies

```sh
npm install
```

### Start development server

```sh
npm run dev
```

## Release

### Build for production

```sh
 vite build --mode production
```

### Deploy to Firebase hosting

```sh
firebase deploy --only hosting
```