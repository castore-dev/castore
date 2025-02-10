# Postgres Event Storage Adapter

DRY Castore [`EventStorageAdapter`](https://castore-dev.github.io/castore/docs/event-sourcing/fetching-events/) implementation using a Postgres database.

## 📥 Installation

```bash
# npm
npm install @castore/event-storage-adapter-postgres

# yarn
yarn add @castore/event-storage-adapter-postgres
```

This package has `@castore/core` as peer dependency, so you will have to install it as well:

```bash
# npm
npm install @castore/core

# yarn
yarn add @castore/core
```

## 👩‍💻 Usage

```ts
import { PostgresEventStorageAdapter } from '@castore/event-storage-adapter-postgres';

const pokemonsEventStorageAdapter = new PostgresEventStorageAdapter({
  // 👇 You can specify a connection string for your Postgres database
  connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres',
});

const pokemonsEventStore = new EventStore({
  ...
  eventStorageAdapter: pokemonsEventStorageAdapter,
});
```

## 🤔 How it works

This adapter simply persists events in a Postgres database. 
