import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material'; 
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'; 

const HIGHLIGHT_COLOR = '#1e293b'; 

const PendingApprovalPage = () => {
    return (
        <Box 
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
            }}
        >
            <Paper 
                elevation={6} 
                sx={{
                    maxWidth: 500,
                    padding: 4,
                    borderRadius: '12px',
                    textAlign: 'center',
                    borderTop: `5px solid ${HIGHLIGHT_COLOR}`, 
                    bgcolor: 'white',
                    color: 'text.primary', 
                }}
            >
                <HourglassEmptyIcon sx={{ fontSize: 60, color: HIGHLIGHT_COLOR, mb: 2 }} /> 
                
                <Typography component="h2" variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Solicitação Recebida!
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    Seu pedido de registro foi enviado para a equipe de administração da ThriveCorp.
                    Aguarde a ativação da sua conta para realizar o primeiro acesso.
                </Typography>

                <Button
                    component={RouterLink}
                    to="/login"
                    variant="contained"
                    size="large"
                    disableElevation
                    sx={{ 
                        fontWeight: 'bold', 
                        borderRadius: '8px', 
                        bgcolor: HIGHLIGHT_COLOR,
                        color: 'white', 
                        '&:hover': {
                            bgcolor: '#374151',
                        }
                    }}
                >
                    Acessar Página de Login
                </Button>
            </Paper>
        </Box>
    );
};

export default PendingApprovalPage;