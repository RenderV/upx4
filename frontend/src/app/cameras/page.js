'use client'
import SelectionWrapper from "./components/selectionWrapper"
import styles from './page.module.css'
import { useEffect, useState } from "react"
import { editModeType } from "./components/selector"
import { Add, ArrowLeft, Delete, EditNote, Lock } from "@mui/icons-material";
import MenuItem from './components/menuItem'
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch"
import VideoJS from "./components/videojs"
import { getSelection, postSelection } from "./utils/fetchPoints"

export default function Home() {
  const [editMode, setEditMode] = useState(editModeType.CREATE)
  const [startingPoints, setStartingPoints] = useState([])
  const getBClass = (mode) => {
    const className = mode === editMode
      ? styles.active
      : ""
    return styles.controlButton + " " + className
  }

  const videoJsOptions = {
    autoplay: true,
    controls: false,
    responsive: true,
    fluid: true,
    sources: [{
      src: 'http://localhost:8888/collingwood/index.m3u8',
      type: 'application/x-mpegURL'
    }]
  };

  useEffect(() => {
    // getSelection(setStartingPoints)
  }, [])

  return (
    <>
      <TransformWrapper
        doubleClick={{ disabled: true }}
      >
        <TransformComponent wrapperStyle={{
          width: "100%",
          height: "100%"
        }}
          contentStyle={{ width: "100%", height: "100%" }}>
          <div className={styles.videoContainer}>
            <SelectionWrapper editMode={editMode} startingPoints={startingPoints} onUpdatePos={()=>{}}>
              <VideoJS options={videoJsOptions} />
            </SelectionWrapper>
          </div>
        </TransformComponent>
      </TransformWrapper>
      <div className={styles.canvasController}>
        <MenuItem Icon={Add} className={getBClass(editModeType.CREATE)} title="Adicionar" onClick={() => setEditMode(editModeType.CREATE)} />
        <MenuItem Icon={EditNote} className={getBClass(editModeType.EDIT)} title="Editar" onClick={() => setEditMode(editModeType.EDIT)} />
        <MenuItem Icon={Lock} className={getBClass(editModeType.BLOCK)} title="Bloquear Edição" onClick={() => setEditMode(editModeType.BLOCK)} />
        <MenuItem Icon={Delete} className={getBClass(editModeType.DELETE)} title="Deletar Seleção" onClick={() => setEditMode(editModeType.DELETE)} />
        <ArrowLeft className={styles.drawer} />
      </div>
    </>
  )
}