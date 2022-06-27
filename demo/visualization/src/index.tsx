import React from 'react';
import ReactDOM from 'react-dom';

import {
  counterEventStore,
  createUser,
  deleteUser,
  userEventStore,
} from '@castore/demo-blueprint';

import './index.css';

import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App
      eventStores={[userEventStore, counterEventStore]}
      commands={[createUser, deleteUser]}
    />
  </React.StrictMode>,
  document.getElementById('root'),
);
