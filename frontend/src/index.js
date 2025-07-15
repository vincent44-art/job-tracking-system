import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css';  // Correct import for Ant Design v5
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);