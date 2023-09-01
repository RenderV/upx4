'use client'
import { LiveTv, Logout, Feed, Dashboard, Person, DarkMode } from "@mui/icons-material";
import Head from "next/head";
import Menu from "./components/menu";
import './global_style.css';
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

export default function Layout({ children }) {
  const [theme, setTheme] = useState('light')
  return (
    <html lang='pt-BR'>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap" rel="stylesheet"/>
      </Head>
      <body>
        <main>
        <div className="main-container">
          <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
            <Menu menuItems={menuItems} setTheme={setTheme} theme={theme}/>
            <div className={"content "+theme}>
              {children}
            </div>
          </ThemeProvider>
        </div>
        </main>
      </body>
    </html>
  );
}
