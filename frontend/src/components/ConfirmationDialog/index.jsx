import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    useTheme
} from '@mui/material';

const ConfirmationDialog = ({ open, onClose, onConfirm, title, message }) => {
    const theme = useTheme();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="confirmation-dialog-title"
            PaperProps={{
                style: {
                    borderRadius: '12px',
                    padding: '16px',
                },
            }}
        >
            <DialogTitle id="confirmation-dialog-title" sx={{ fontWeight: 'bold' }}>
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="confirmation-dialog-description">
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ padding: '0 24px 16px' }}>
                <Button 
                    onClick={onClose} 
                    sx={{ 
                        color: theme.palette.text.secondary, 
                        fontWeight: 'bold',
                        borderRadius: '8px'
                    }}
                >
                    Cancelar
                </Button>
                <Button 
                    onClick={onConfirm} 
                    autoFocus 
                    variant="contained" 
                    color={title.toLowerCase().includes('excluir') || title.toLowerCase().includes('rejeitar') ? 'error' : 'primary'}
                    disableElevation
                    sx={{
                        fontWeight: 'bold',
                        borderRadius: '8px'
                    }}
                >
                    Confirmar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationDialog;