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

## Database Table Structure and Customization

Below is an overview of the underlying table structure used by the adapter and the available customization options when creating the event table.

### Table Structure Overview

| Column         | Data Type(s)                                                | Default Customization     | Description                                                                     |
| -------------- | ----------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------- |
| id             | BIGSERIAL (or SERIAL if specified via idType)               | BIGSERIAL                 | Primary key; auto-incrementing identifier                                       |
| aggregate_name | VARCHAR(aggregateNameLength)                                | VARCHAR(32)               | Aggregate name (identifies the event store)                                     |
| aggregate_id   | UUID, ULID, or VARCHAR(aggregateId.length if type is VARCHAR) | UUID                      | Identifier for the aggregate; if using VARCHAR, a length must be specified        |
| version        | BIGINT (or INTEGER if specified via versionType)            | BIGINT                    | Event version number                                                            |
| type           | VARCHAR(typeLength)                                         | VARCHAR(64)               | Name of the event type                                                          |
| data           | JSONB                                                       | n/a                       | Event payload stored in JSONB                                                   |
| metadata       | JSONB                                                       | n/a                       | Additional event metadata                                                       |
| timestamp      | TIMESTAMPTZ with DEFAULT CURRENT_TIMESTAMP(3)              | CURRENT_TIMESTAMP(3)      | Timestamp of the event (set automatically at insertion)                         |
| UNIQUE         | (aggregate_name, aggregate_id, version)                     | n/a                       | Enforces that each combination of aggregate_name, aggregate_id, and version is unique |

### Customizable Options in createEventTable

| Option              | Default Value    | Allowed Values / Description                                                                                 |
| ------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------ |
| tableName           | event            | Name of the table to be created                                                                              |
| idType              | BIGSERIAL        | Database type for the id column; allowed values: BIGSERIAL or SERIAL                                           |
| aggregateNameLength | 32               | Length for the aggregate_name VARCHAR column                                                                 |
| aggregateId         | { type: "UUID" } | Defines the aggregate_id column type; can be UUID, ULID, or VARCHAR (if using VARCHAR, a length must be provided) |
| versionType         | BIGINT           | Database type for the version column; allowed values: BIGINT or INTEGER                                        |
| typeLength          | 64               | Length for the type VARCHAR column                                                                           |

Additionally, indexes are created on aggregate_name, version, and a composite index on (aggregate_name, aggregate_id) to enhance query performance.
