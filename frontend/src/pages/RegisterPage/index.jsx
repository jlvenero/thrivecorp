import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'company_admin',
        company_name: '',
        company_cnpj: '',
        company_address: '',
        provider_name: '',
        provider_cnpj: '',
        provider_address: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem. Por favor, tente novamente.');
        setLoading(false);
        return;
    }

    try {
        const response = await axios.post('http://localhost:3000/api/auth/register', formData);

        console.log('Registro enviado com sucesso:', response.data);
        navigate('/pending-approval', { replace: true });

    } catch (err) {
        setError('Falha no registro. Tente novamente.');
        console.error(err);
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="register-container">
            <h2>Registro de Usuário</h2>
            <form onSubmit={handleSubmit} className="register-form">
                <input type="text" name="first_name" value={formData.first_name} onChange={handleFormChange} placeholder="Primeiro Nome" required />
                <input type="text" name="last_name" value={formData.last_name} onChange={handleFormChange} placeholder="Sobrenome" required />
                <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="Email" required />
                <input type="password" name="password" value={formData.password} onChange={handleFormChange} placeholder="Senha" required />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleFormChange} placeholder="Confirme a Senha" required />

                <select name="role" value={formData.role} onChange={handleFormChange} required>
                    <option value="company_admin">Administrador de Empresa</option>
                    <option value="provider">Prestador de Serviço</option>
                </select>

                {formData.role === 'company_admin' && (
                    <div className="conditional-fields">
                        <input type="text" name="company_name" value={formData.company_name} onChange={handleFormChange} placeholder="Nome da Empresa" required />
                        <input type="text" name="company_cnpj" value={formData.company_cnpj} onChange={handleFormChange} placeholder="CNPJ da Empresa" required />
                        <input type="text" name="company_address" value={formData.company_address} onChange={handleFormChange} placeholder="Endereço da Empresa" required />
                    </div>
                )}

                {formData.role === 'provider' && (
                    <div className="conditional-fields">
                        <input type="text" name="provider_name" value={formData.provider_name} onChange={handleFormChange} placeholder="Nome da Academia" required />
                        <input type="text" name="provider_cnpj" value={formData.provider_cnpj} onChange={handleFormChange} placeholder="CNPJ da Academia" required />
                        <input type="text" name="provider_address" value={formData.provider_address} onChange={handleFormChange} placeholder="Endereço da Academia" required />
                    </div>
                )}
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Cadastrando...' : 'Cadastrar'}
                </button>
            </form>
            <p className="link-login">Já tem cadastro? <Link to="/login">Faça Login</Link></p>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default RegisterPage;