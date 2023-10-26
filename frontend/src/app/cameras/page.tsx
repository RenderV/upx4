'use client'
import React, { useState } from "react";
import { EditMode } from "./types";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import styles from "./page.module.css"
import CanvasController from "./components/selectionController";
import SelectionWrapper from "./components/selectionWrapper";
import VideoJS from "./components/videojs";

export default function Home() {
  const [editMode, setEditMode] = useState(EditMode.ADD);
  const changeMode = (mode: EditMode)=>{
    setEditMode(mode)
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

  return (
    <>
      <TransformWrapper doubleClick={{ disabled: true }}>
        <TransformComponent
          wrapperStyle={{
            width: "100%",
            height: "100%"
          }}
          contentStyle={{
            width: "100%",
            height: "100%"
          }}
        >
          <div className={styles.videoContainer}>
            <SelectionWrapper editMode={editMode} changeMode={changeMode}>
              <VideoJS options={videoJsOptions} />
            </SelectionWrapper>
          </div>
        </TransformComponent>
      </TransformWrapper>
      <CanvasController editMode={editMode} changeMode={setEditMode} />
    </>
  );
}
