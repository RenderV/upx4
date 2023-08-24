import React from "react";
import { Tooltip } from "@mui/material";
import { Outlet, NavLink } from "react-router-dom";

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
        <MenuItem icon={<menuItems.LogoutIcon />} title="Log out" link = 'logout' />
      </div>
    </div>
  );
}

function MenuItem({ icon, title, link }) {
  return (
    <div className="menu-item">
      <NavLink to={link}>
        <Tooltip title={title} placement="right">
          {icon}
        </Tooltip>
      </NavLink>
    </div>
  );
}

function AppLayout({ menuItems }) {
  return (
    <div className="main-container">
      <Menu menuItems={menuItems} />
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

export default AppLayout;