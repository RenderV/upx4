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
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  label: string
  onKeyDown: React.KeyboardEventHandler
}

export default function LabelModal({
  open,
  setOpen,
  label,
  onKeyDown
}: LabelModelProps) {
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button onClick={handleOpen}>Open modal</Button>
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
