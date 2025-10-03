import React, { useState } from 'react';
import axios from 'axios';
import './ChangePasswordPage.css';
import { Link } from 'react-router-dom';

const ChangePasswordPage = () => {
    const [formData, setFormData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('A nova senha e a confirmação não coincidem.');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:3000/api/auth/change-password', {
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Senha alterada com sucesso!');
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.error || 'Falha ao alterar a senha. Verifique sua senha antiga.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="change-password-container">
            <h3>Alterar Senha</h3>
            <form onSubmit={handleSubmit} className="change-password-form">
                <input type="password" name="oldPassword" value={formData.oldPassword} onChange={handleChange} placeholder="Senha Atual" required />
                <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Nova Senha" required />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirme a Nova Senha" required />
                <button type="submit" disabled={loading}>
                    {loading ? 'Alterando...' : 'Alterar Senha'}
                </button>
            </form>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <Link to="/dashboard" className="back-link">Voltar para o Dashboard</Link>
        </div>
    );
};

export default ChangePasswordPage;