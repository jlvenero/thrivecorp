// frontend/src/apiConfig.js

// 1. Verifica se a variável de ambiente VITE_API_URL (do Vercel/Railway) existe.
// 2. Se não existir (estamos local), usa '${API_URL}' como padrão.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// (Poderíamos até já configurar o axios aqui, mas vamos manter simples por enquanto)