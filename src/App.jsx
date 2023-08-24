import React from "react";
import { createBrowserRouter,  createRoutesFromElements,  Route, RouterProvider } from "react-router-dom";
import { LiveTv, Logout, Feed, Dashboard, Person } from "@mui/icons-material";
import AppLayout from "./layouts/appLayout";
import './style.css'
import {Test, loader} from "./pages/test";
import DraggableComponent from "../tools/dragrec";

const n = 1
const pagesIcons = [LiveTv, ...Array(n).fill(Feed), Dashboard];
const titles = ["Live Camera", ...Array(n).fill("Feed"), "Dashboard"];
const links = ["livecam", ...(Array(n).fill("feed").map((it, id) => it+id)), 'dashboard']

const menuItems = {
  UserIcon: Person,
  LogoutIcon: Logout,
  pageItems: pagesIcons.map((Icon, index) => ({
    Icon,
    title: titles[index],
    link: links[index]
  })),
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<AppLayout menuItems={menuItems}/>}>
      <Route path="" element={<DraggableComponent/>}></Route>
      <Route path="/dragtest" element={<DraggableComponent/>}></Route>
      <Route path=":id" element={<Test/>} loader={loader}></Route>
    </Route>
  )
)

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
