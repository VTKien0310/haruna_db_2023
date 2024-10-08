# haruna_db_2023

## About

A multipurpose application for everyday use. The application currently provides:

- Images and videos storage
- Translation for English and Japanese

The application's namesake is derived from the
battleship [Haruna](https://en.wikipedia.org/wiki/Japanese_battleship_Haruna).

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

### Start Edge functions

```sh
supabase functions serve --env-file ./supabase/functions/.env.local
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
