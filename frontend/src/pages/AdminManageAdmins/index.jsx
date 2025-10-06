import React, { useState } from 'react';
import axios from 'axios';
import './AdminManageAdmins.css';

const AdminManageAdmins = () => {
    const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3000/api/admin/admins', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess(`Administrador "${formData.first_name}" criado com sucesso!`);
            setFormData({ first_name: '', last_name: '', email: '', password: '' }); // Limpa o formulário
        } catch (err) {
            setError(err.response?.data?.error || 'Falha ao criar administrador.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="manage-admins-container">
            <h3>Gerenciar Administradores ThriveCorp</h3>
            <form onSubmit={handleSubmit} className="manage-admins-form">
                <h4>Adicionar Novo Administrador</h4>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Primeiro Nome" required />
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Sobrenome" required />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Senha Provisória" required />
                <button type="submit" disabled={loading}>
                    {loading ? 'Criando...' : 'Criar Administrador'}
                </button>
            </form>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
        </div>
    );
};

export default AdminManageAdmins;