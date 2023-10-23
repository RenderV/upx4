'use client'
// import SelectionWrapper from "./components/selectionWrapper"
import styles from './page.module.css'
import { useEffect, useState, useRef } from "react"
import { editModeType } from "./components/selector"
import { Add, ArrowLeft, Delete, EditNote, Lock } from "@mui/icons-material";
import MenuItem from './components/menuItem'
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch"
// import VideoJS from "./components/videojs"
// import { getSelection, postSelection } from "./utils/fetchPoints"
import { SelectorLine, SelectorPoints, Selection, Selector } from './components/newSelector'

export default function Home() {
  const [editMode, setEditMode] = useState(editModeType.CREATE)
  const [startingPoints, setStartingPoints] = useState([])
  const getBClass = (mode) => {
    const className = mode === editMode
      ? styles.active
      : ""
    return styles.controlButton + " " + className
  }

  // const videoJsOptions = {
  //   autoplay: true,
  //   controls: false,
  //   responsive: true,
  //   fluid: true,
  //   sources: [{
  //     src: 'http://localhost:8888/collingwood/index.m3u8',
  //     type: 'application/x-mpegURL'
  //   }]
  // };
  const svgRef = useRef(null)

  const videoJsOptions = {
    autoplay: true,
    controls: false,
    responsive: true,
    fluid: true,
    sources: [{
      src: '/collingwood.mp4',
      type: 'video/mp4'
    }]
  };

  useEffect(() => {
    // getSelection(setStartingPoints)
  }, [])

  const initialSelections = [
    {
      points:
        [
          { x: 60, y: 30, ox: 30, oy: 30, lines: [null, null], objId: "0a" },
          { x: 430, y: 410, ox: 60, oy: 30, lines: [null, null], objId: "0b" },
          { x: 200, y: 150, ox: 20, oy: 10, lines: [null, null], objId: "0c" },
          { x: 300, y: 250, ox: 10, oy: 20, lines: [null, null], objId: "0d" },
          { x: 120, y: 380, ox: 30, oy: 10, lines: [null, null], objId: "0e" }
        ],
      label: "1"
    }
    ,
    {
      points:
        [
          { x: 50, y: 60, ox: 10, oy: 20, lines: [null, null], objId: "1a" },
          { x: 150, y: 90, ox: 20, oy: 15, lines: [null, null], objId: "1b" },
          { x: 250, y: 120, ox: 15, oy: 25, lines: [null, null], objId: "1c" }
        ],
      label: "2"
    }
  ];


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
            {/* <SelectionWrapper editMode={editMode} startingPoints={startingPoints} onUpdatePos={()=>{}}>
              <VideoJS options={videoJsOptions} />
            </SelectionWrapper> */}
            <Selector
              width="1280px"
              height="720px"
              viewBox="0 0 1000 1000"
              initialSelections={[]}
              editMode='add'
            />
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