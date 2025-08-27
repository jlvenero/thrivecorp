// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom'; // Importe o BrowserRouter aqui

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* O App agora é um filho do BrowserRouter */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);