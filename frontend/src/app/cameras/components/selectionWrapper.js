import SelectionCanvas from "./selector";
import style from './selectionWrapper.module.css'
import React from "react";

export default function SelectionWrapper({children, aspectRatio, editMode, startingPoints=[], onUpdatePos=()=>{}}) {
  if (!React.isValidElement(children)) {
    throw new Error("DraggableComponent must have a single valid React element as its child.");
  }
    return (
        <div className={style.selectionWrapper} style = {{aspectRatio: aspectRatio}}>
            {children}
            <SelectionCanvas editMode={editMode} startingPoints={startingPoints} onUpdatePos={onUpdatePos}/>
        </div>
    )
}