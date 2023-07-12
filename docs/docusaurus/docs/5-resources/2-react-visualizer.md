---
sidebar_position: 2
---

# React Visualizer

React component to visualize, design and manually test [Castore](https://github.com/castore-dev/castore) event stores and commands.

Here is a [hosted example](https://castore-dev.github.io/castore/), based on the main README code snippets on pokemons and trainers. You can find the related source code (commands & event stores) in the [demo package](https://github.com/castore-dev/castore/tree/main/demo/blueprint/src).

## 📥 Installation

```bash
# npm
npm install --save-dev @castore/react-visualizer

# yarn
yarn add --dev @castore/react-visualizer
```

This package has `@castore/core`, `@castore/json-schema-command` and `react` (above v17) as peer dependencies, so you will have to install them as well:

```bash
# npm
npm install @castore/core @castore/json-schema-command react

# yarn
yarn add @castore/core @castore/json-schema-command react
```

## 👩‍💻 Usage

```tsx
// ...somewhere in your React App
import { tuple } from '@castore/core';
import { Visualizer } from '@castore/react-visualizer';

const MyPage = () =>
  <Visualizer
    eventStores={[
      eventStoreA,
      eventStoreB
      ...
    ]}
    // 👇 `tuple` is only used for type inference
    commands={tuple(
      commandA,
      commandB
      ...
    )}
    // 👇 Provide additional context arguments
    // (see https://github.com/castore-dev/castore#--command)
    contextsByCommandId={{
      COMMAND_A_ID: [{ generateUuid: uuid }],
      ...
    }}
  />
```

It will render a [visualizer](https://castore-dev.github.io/castore/).

## ☝️ Warning

| ❌ **This package is not an admin** ❌ |
| -------------------------------------- |

We are thinking about re-using some Components to develop an admin, but it is NOT an admin for now. It's main goal is to visualize, design and manually test your event stores and commands, as well as getting familiar with the event sourcing paradigm.

No connection to a DB or API is actually done. All the data is stored locally your web page, thanks to a [`ReduxEventStorageAdapter`](https://github.com/castore-dev/castore/tree/main/packages/redux-event-storage-adapter).

Also, the forms are generated with [`react-json-schema-form`](https://github.com/rjsf-team/react-jsonschema-form), so only `JSONSchemaCommand`s are supported.

## 🎨 Unthemed component

The visualizer uses the [MUI](https://mui.com/) components library. You can customize its design by providing your own theme:

```tsx
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { UnthemedVisualizer } from '@castore/react-visualizer';

const customTheme = createTheme({
  // ...
})

const MyPage = () =>
  <ThemeProvider theme={customTheme}>
    <CssBaseline/>
    <UnthemedVisualizer ... />
  </Theme>
```
