import { ButtonBase, Tooltip } from "@mui/material"

export default function MenuItem({ Icon, title, onClick, className}) {
  return (
    <ButtonBase component='div' onClick={onClick} className={className}> 
        <Tooltip title={title} placement="left">
          <Icon style={{color: '#d9d9d9'}}/>
        </Tooltip>
    </ButtonBase>
  );
}
