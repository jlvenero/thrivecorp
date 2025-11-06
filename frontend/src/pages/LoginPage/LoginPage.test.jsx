// frontend/src/pages/LoginPage/LoginPage.test.jsx

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Necessário porque LoginPage usa <Link>
import { describe, it, expect } from 'vitest';
import LoginPage from './index';

describe('LoginPage', () => {
    
    it('deve renderizar o título "ThriveCorp"', () => {
        // Renderiza o componente "envolvido" em um MemoryRouter
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        // Procura pelo texto "ThriveCorp" na tela
        const titleElement = screen.getByText('ThriveCorp');
        
        // Afirma que o elemento está no documento
        expect(titleElement).toBeInTheDocument();
    });

    it('deve renderizar o subtítulo "Entre na sua conta"', () => {
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );
        
        expect(screen.getByText('Entre na sua conta')).toBeInTheDocument();
    });
});