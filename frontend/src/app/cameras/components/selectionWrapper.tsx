import React, { ReactElement } from "react";
import Selector from "./selector";
import style from './selectionWrapper.module.css';
import { EditMode } from "../types";

interface SelectionWrapperProps {
  children: ReactElement;
  aspectRatio?: string;
  editMode: EditMode;
}

export default function SelectionWrapper({
  children,
  aspectRatio="16 / 9",
  editMode,
}: SelectionWrapperProps) {

  return (
    <div className={style.selectionWrapper} style={{ aspectRatio: aspectRatio }}>
      {children}
      <Selector
        width="1280px"
        height="720px"
        viewBox="0 0 1000 1000"
        initialSelections={[]}
        editMode={editMode}
      />
    </div>
  );
}
