---
sidebar_position: 1
---

# Installation

```bash
# npm
npm install @castore/core

# yarn
yarn add @castore/core
```

Castore is not a single package, but a **collection of packages** revolving around a `core` package. This is made so every line of code added to your project is _opt-in_, wether you use tree-shaking or not.

Castore packages are **released together**. Though different versions may be compatible, you are **guaranteed** to have working code as long as you use matching versions.

Here is an example of working `package.json`:

```js
{
  ...
  "dependencies": {
    "@castore/core": "1.3.1",
    "@castore/dynamodb-event-storage-adapter": "1.3.1"
    ...
  },
  "devDependencies": {
    "@castore/test-tools": "1.3.1"
    ...
  }
}
```
