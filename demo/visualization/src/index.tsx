import React from 'react';
import ReactDOM from 'react-dom';
import { v4 as uuid } from 'uuid';

import { tuple } from '@castore/core';
import {
  counterEventStore,
  createUserCommand,
  deleteUserCommand,
  userEventStore,
} from '@castore/demo-blueprint';

import App from './App';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <App
      eventStores={[userEventStore, counterEventStore]}
      commands={tuple(createUserCommand, deleteUserCommand)}
      contextsByCommandId={{
        CREATE_USER: [{ generateUuid: uuid }],
      }}
    />
  </React.StrictMode>,
  document.getElementById('root'),
);
