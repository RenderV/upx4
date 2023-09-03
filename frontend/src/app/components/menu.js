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

function Menu({ menuItems, setTheme, theme }) {
  const toggleTheme = () => {
    if(theme === 'dark'){
      setTheme('light')
    } else if (theme === 'light'){
      setTheme('dark')
    }
  }
  return (
    <div className="menu">
      <div className="menu-section menu-section-user">
        <MenuItem icon={<menuItems.UserIcon />} link=''/>
      </div>
      <div className="menu-section menu-section-pages">
        <div className="menu-items-container">
          {menuItems.pageItems.map((item, index) => (
            <MenuItem key={index} icon={<item.Icon />} title={item.title} link={item.link} />
          ))}
        </div>
      </div>
      <div className="menu-section menu-section-logout">
        <MenuItem icon={<menuItems.DarkModeIcon />} title="Modo Escuro" link='' onclick={toggleTheme}/>
        <MenuItem icon={<menuItems.LogoutIcon />} title="Log out" link='' />
      </div>
    </div>
  );
}

export default Menu;