'use client'
import React, { useEffect, useState } from "react";
import { EditMode } from "./types";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import styles from "./page.module.css"
import CanvasController from "./components/selectionController";
import SelectionWrapper from "./components/selectionWrapper";
import VideoJS from "./components/videojs";
import { SelectionType } from "./types";
import { createPoint } from "./components/utils";

async function getData(fn: (data: any) => {}) {
  const res = await fetch('http://localhost:8000/api/cams/1/')
  console.log(res)

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  const data = await res.json()
  return fn(data)
}

function getInitialCoordinates(data: any, setFn: any) {
  const parking_spaces = data.parking_spaces
  const initialCoordinates: SelectionType[] = parking_spaces.map((parking_space: any) => {
    return ({
      "objId": parking_space.id,
      "label": parking_space.label,
      "points": parking_space.selection.map((point: any) => createPoint(point))
    })
  })
  setFn(initialCoordinates)
}

export default function VideoAndEditor() {
  const [editMode, setEditMode] = useState(EditMode.ADD);
  const changeMode = (mode: EditMode) => {
    setEditMode(mode)
  }
  const initialCoordinates: SelectionType[] = []
  const [selections, setSelections] = useState(initialCoordinates)
  const fn: any = (data: any) => getInitialCoordinates(data, setSelections)

  useEffect(() => {
    getData(fn)
  }, []
  )

  const videoJsOptions = {
    autoplay: true,
    controls: false,
    responsive: true,
    fluid: true,
    sources: [{
      src: 'http://localhost:8888/opencv/index.m3u8',
      type: 'application/x-mpegURL'
    }],
  };


  return (
    <>
      <TransformWrapper doubleClick={{ disabled: true }} pinch={{ step: 300 }}>
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
            <SelectionWrapper editMode={editMode} size={{ width: 1280, height: 720 }} changeMode={changeMode} initialCoordinates={selections} setSelections={setSelections}>
              <VideoJS options={videoJsOptions} />
            </SelectionWrapper>
          </div>
        </TransformComponent>
      </TransformWrapper>
      <CanvasController editMode={editMode} changeMode={setEditMode} />
    </>
  );
}
