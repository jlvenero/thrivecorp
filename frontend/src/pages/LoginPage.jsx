import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importe o hook
import axios from 'axios';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Inicialize o hook de navegação

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Se o token existe, o usuário já está logado, redirecione-o
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                email,
                password
            });

            const token = response.data.token;
            const userRole = response.data.user.role;

            localStorage.setItem('token', token);
            localStorage.setItem('userRole', userRole);

            console.log('Login bem-sucedido!', response.data);
            
            // Redireciona o usuário para o dashboard após o login
            navigate('/dashboard', { replace: true });

        } catch (err) {
            setError('Falha no login. Verifique seu email e senha.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Senha:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;