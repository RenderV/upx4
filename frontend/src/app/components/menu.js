import React from "react";
import MenuItem from "./item";

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