import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';


const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 235,
  bgcolor: 'background.paper',
  borderRadius: '11px',
  boxShadow: 24,
  p: 4,
};

interface LabelModelProps {
  open: boolean
  setOpen: (state: boolean) => void
  label: string
  onKeyDown: React.KeyboardEventHandler
}

export default function LabelModal({
  open,
  setOpen: openModal,
  label,
  onKeyDown
}: LabelModelProps) {
  const handleOpen = () => openModal(true);
  const handleClose = () => openModal(false);

  return (
    <div onKeyDown={(e) => {e.stopPropagation()}}>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <TextField id="outlined-basic" label="Label" defaultValue={label} variant="outlined" onKeyDown={onKeyDown}/>
        </Box>
      </Modal>
    </div>
  );
}
