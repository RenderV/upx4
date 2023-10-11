import Head from "next/head";
import React from "react";
import ContentWrapper from "./components/contentwrapper";
import './global_style.css';

export const metadata = {
  title: 'test',
  content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
}
 
export default function Layout({ children }) {
  return (
    <html lang='pt-BR'>
      <Head/>
      <React.StrictMode>
      <body>
        <main>
        <div className="main-container">
          <ContentWrapper>
                {children}
          </ContentWrapper>
        </div>
        </main>
      </body>
      </React.StrictMode>
    </html>
  );
}