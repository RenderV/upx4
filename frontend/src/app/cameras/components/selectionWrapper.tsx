import React, { ReactElement } from "react";
import Selector from "./selector";
import style from './selectionWrapper.module.css';
import { EditMode } from "../types";
import { SelectionType } from "../types";

interface SelectionWrapperProps {
  children: ReactElement;
  size: { width: number; height: number };
  changeMode: (mode: EditMode) => void;
  editMode: EditMode;
  initialCoordinates: SelectionType[];
  setSelections: (selections: SelectionType[]) => void;
}

export default function SelectionWrapper({
  children,
  size,
  editMode,
  changeMode,
  initialCoordinates,
  setSelections
}: SelectionWrapperProps) {

  const aspectRatio = size.width / size.height;
  return (
    <div className={style.selectionWrapper} style={{ aspectRatio: aspectRatio }}>
      {children}
      <Selector
        width={String(size.width)}
        height={String(size.height)}
        viewBox={`0 0 ${size.width} ${size.height}`}
        initialSelections={initialCoordinates}
        editMode={editMode}
        changeMode={changeMode}
        setSelections={setSelections}
      />
    </div>
  );
}
