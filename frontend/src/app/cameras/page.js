'use client'
import SelectionWrapper from "./components/selectionWrapper"
import styles from './page.module.css'
import { useState } from "react"
import { editModeType } from "./components/selector"
import { Add, ArrowLeft, Delete, EditNote, Lock } from "@mui/icons-material";
import MenuItem from './components/menuItem'
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch"

export default function Home() {
  const [editMode, setEditMode] = useState(editModeType.CREATE)
  const getBClass = (mode) => {
    const className = mode === editMode
    ? styles.active
    : ""
    return styles.controlButton+" "+className
  }
  return (
    <>
    <TransformWrapper
          doubleClick={{ disabled: true }}
    >
    <TransformComponent wrapperStyle={{
      width: "100%",
      height: "100%"
      }}
      contentStyle={{width: "100%", height: "100%"}}>
      <div className={styles.videoContainer}>
        <SelectionWrapper editMode={editMode}>
            <video className={styles.video} autoPlay={true} name="media" src="collingwood.mp4#t=12000" type="video/mp4"></video>
        </SelectionWrapper>
      </div>
    </TransformComponent>
    </TransformWrapper>
    <div className={styles.canvasController}>
      <MenuItem Icon={Add} className={getBClass(editModeType.CREATE)} title="Adicionar" onClick = {() => setEditMode(editModeType.CREATE)}/>
      <MenuItem Icon={EditNote} className={getBClass(editModeType.EDIT)} title="Editar" onClick = {() => setEditMode(editModeType.EDIT)}/>
      <MenuItem Icon={Lock} className={getBClass(editModeType.BLOCK)} title="Bloquear Edição" onClick={() => setEditMode(editModeType.BLOCK)}/>
      <MenuItem Icon={Delete} className={getBClass(editModeType.DELETE)} title="Deletar Seleção" onClick={() => setEditMode(editModeType.DELETE)}/>
      <ArrowLeft className={styles.drawer}/>
    </div>
    </>
  )
}