import React from 'react';
import ReactDOM from 'react-dom';

import {
  counterEventStore,
  createUserCommand,
  deleteUserCommand,
  userEventStore,
} from '@castore/demo-blueprint';

import './index.css';

import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App
      eventStores={[userEventStore, counterEventStore]}
      commands={[createUserCommand, deleteUserCommand]}
    />
  </React.StrictMode>,
  document.getElementById('root'),
);
