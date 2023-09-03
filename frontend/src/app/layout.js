import Head from "next/head";
import ContentWrapper from "./components/contentwrapper";
import './global_style.css';

export const metadata = {
  title: 'test',
  content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
}
 
export default function Layout({ children }) {
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
          <ContentWrapper>
                {children}
          </ContentWrapper>
        </div>
        </main>
      </body>
    </html>
  );
}
