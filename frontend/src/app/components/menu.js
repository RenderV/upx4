import React from "react";
import MenuItem from "./item"; // Import the MenuItem component from the item.js file

function Menu({ menuItems }) {
  return (
    <div className="menu">
      <div className="menu-section menu-section-user">
        <MenuItem icon={<menuItems.UserIcon />} link='user' />
      </div>
      <div className="menu-section menu-section-pages">
        <div className="menu-items-container">
          {menuItems.pageItems.map((item, index) => (
            <MenuItem key={index} icon={<item.Icon />} title={item.title} link={item.link} />
          ))}
        </div>
      </div>
      <div className="menu-section menu-section-logout">
        <MenuItem icon={<menuItems.LogoutIcon />} title="Log out" link='logout' />
      </div>
    </div>
  );
}

export default Menu;
