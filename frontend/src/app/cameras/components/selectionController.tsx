'use client'
import React, { useEffect, useRef, useState } from "react";
import { EditMode, MenuItemProps, EditModeButton, CanvasControllerProps } from "../types";
import { modeMap } from "./selector"
import { Add, ArrowLeft, Delete, EditNote, Lock, VisibilityOff } from "@mui/icons-material";
import { ButtonBase, Tooltip } from "@mui/material";
import styles from "../page.module.css";

function MenuItem({ Icon, title, onClick, className }: MenuItemProps) {
    return (
        <ButtonBase component="div" onClick={onClick} className={className}>
            <Tooltip title={title} placement="left">
                <Icon style={{ color: '#d9d9d9' }} />
            </Tooltip>
        </ButtonBase>
    );
}

function CanvasController({ editMode, setEditMode }: CanvasControllerProps) {

    const [isDrawn, setDrawn] = useState(false)
    const timer = useRef<NodeJS.Timeout>()
    const getBClass = (mode: EditMode) => {
        let activeClass;
        if (mode === editMode) {
            activeClass = isDrawn ? styles.animactive : styles.active;
        } else {
            activeClass = styles.inactive;
        }
        return `${styles.controlButton} ${activeClass}`;
    };

    const handleKeyboardEvents = (e: KeyboardEvent) => {
        for (const mode in modeMap) {
            if (modeMap.hasOwnProperty(mode)) {
                const modeData = modeMap[mode as EditMode];
                if (modeData.shortcuts.includes(e.key)) {
                    if (timer.current) clearTimeout(timer.current)
                    setEditMode(mode as EditMode)
                    if (e.key === "Escape") {
                        setDrawn(false)
                    } else {
                        setDrawn(true)
                        timer.current = setTimeout(() => {
                            setDrawn(false)
                        }, 1700)
                    }
                }
            }
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', handleKeyboardEvents);

        return () => {
            window.removeEventListener('keydown', handleKeyboardEvents);
        };
    }, []);

    const controllerStyle = `${styles.canvasController} ${!isDrawn ? styles.inactive : styles.active}`

    const menuItems: Array<EditModeButton> = [
        {
            icon: Add,
            label: "Adicionar (A)",
            mode: EditMode.ADD
        },
        {
            icon: EditNote,
            label: "Editar (E)",
            mode: EditMode.EDIT
        },
        {
            icon: Delete,
            label: "Deletar Seleção (D)",
            mode: EditMode.DELETE
        },
        {
            icon: VisibilityOff,
            label: "Ocultar (H)",
            labelInactive: "Mostrar (H)",
            mode: EditMode.HIDE
        }
    ]

    const handleButtonClick = (mode: EditMode) => {
        if (mode === editMode)
            setEditMode(EditMode.DEFAULT)
        else
            setEditMode(mode)
    }

    return (
        <div className={controllerStyle}>
            {menuItems.map((menuItem) => (
                <MenuItem
                    key={menuItem.mode}
                    Icon={menuItem.icon}
                    className={getBClass(menuItem.mode)}
                    title={editMode === menuItem.mode && menuItem.labelInactive ? menuItem.labelInactive : menuItem.label}
                    onClick={() => handleButtonClick(menuItem.mode)}
                />
            ))}
            <ArrowLeft className={styles.drawer} />
        </div>
    );

}

export default CanvasController
