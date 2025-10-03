import React from 'react';
import { Link } from 'react-router-dom';
import './PendingApprovalPage.css';

const PendingApprovalPage = () => {
    return (
        <div className="pending-container">
            <h2>Solicitação de Registro Recebida!</h2>
            <p>
                Obrigado por se registrar na ThriveCorp. Sua solicitação foi enviada para nossa equipe administrativa e está aguardando aprovação.
            </p>
            <p>
                Você receberá uma notificação por e-mail assim que seu acesso for liberado.
            </p>
            <Link to="/login" className="back-to-login">
                Voltar para a Página de Login
            </Link>
        </div>
    );
};

export default PendingApprovalPage;