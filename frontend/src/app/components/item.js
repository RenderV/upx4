'use client'
import React from "react";
import { Tooltip } from "@mui/material";
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import { ButtonBase } from "@mui/material";

function MenuItem({ icon, title, link }) {
  const pathname = usePathname()
  return (
    <ButtonBase component='div'className={pathname == "/"+link ? "menu-item active" : "menu-item"}>
        <Link href={link}>
            <Tooltip title={title} placement="right">
                {icon}
            </Tooltip>
        </Link>
    </ButtonBase>
  );
}

export default MenuItem;