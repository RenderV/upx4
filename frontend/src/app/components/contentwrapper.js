'use client'
import { LiveTv, Logout, Feed, Dashboard, Person, DarkMode } from "@mui/icons-material";
import Menu from "./menu";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@emotion/react";
import { useState } from "react";

const pagesIcons = [LiveTv, Feed, Dashboard];
const titles = ["Câmeras", "Relatórios", "Dashboard"];
const links = ["cameras", "relatorios", "dashboard"];

const menuItems = {
  UserIcon: Person,
  LogoutIcon: Logout,
  DarkModeIcon: DarkMode,
  pageItems: pagesIcons.map((Icon, index) => ({
    Icon,
    title: titles[index],
    link: links[index]
  })),
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

export default function ContentWrapper({ children }) {
  const [theme, setTheme] = useState('light')
  return (
    <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
    <Menu menuItems={menuItems} setTheme={setTheme} theme={theme}/>
        <div className={"content "+theme}>
            {children}
        </div>
    </ThemeProvider>
  );
}