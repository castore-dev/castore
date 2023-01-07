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
import { Visualizer } from '@castore/react-visualizer';

import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <Visualizer
      eventStores={[userEventStore, counterEventStore]}
      commands={tuple(createUserCommand, deleteUserCommand)}
      contextsByCommandId={{
        CREATE_USER: [{ generateUuid: uuid }],
      }}
    />
  </React.StrictMode>,
  document.getElementById('root'),
);
