import React from 'react';
import ReactDOM from 'react-dom';

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
      commands={[createUserCommand, deleteUserCommand]}
    />
  </React.StrictMode>,
  document.getElementById('root'),
);
