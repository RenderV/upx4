import React from "react";
import { LiveTv, Logout, Feed, Dashboard, Person } from "@mui/icons-material";
import Head from "next/head";
import Menu from "./components/menu";
import './style.css';

const pagesIcons = [LiveTv, Feed, Dashboard];
const titles = ["Câmeras", "Relatórios", "Dashboard"];
const links = ["cameras", "relatorios", "dashboard"];

const menuItems = {
  UserIcon: Person,
  LogoutIcon: Logout,
  pageItems: pagesIcons.map((Icon, index) => ({
    Icon,
    title: titles[index],
    link: links[index]
  })),
};

export default function Layout({ children }) {
  return (
    <html lang='pt-BR'>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap" rel="stylesheet"/>
      </Head>
      <body>
        <div className="main-container">
          <Menu menuItems={menuItems} />
          <div className="content">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
