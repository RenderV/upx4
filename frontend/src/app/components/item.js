'use client'
import { Tooltip } from "@mui/material";
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import { ButtonBase } from "@mui/material";
import useMediaQuery from '@mui/material/useMediaQuery';

function MenuItem({ icon, title, link, onclick}) {
  const pathname = usePathname()
  const matches = useMediaQuery('(max-width:900px)')
  return (
    <ButtonBase component='div' className={pathname == "/" + link ? "menu-item active" : "menu-item"} onClick={onclick}>
        <Link href={link}>
            <Tooltip title={title} placement={matches ? 'top' : 'right'}>
                {icon}
            </Tooltip>
        </Link>
    </ButtonBase>
  );
}

export default MenuItem;