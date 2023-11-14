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
}

export default function SelectionWrapper({
  children,
  size,
  editMode,
  changeMode,
}: SelectionWrapperProps) {
const initialSelections: Array<SelectionType> = [
  {
    objId: 'someId1',
    label: 'a',
    points: [
      { objId: 'someId1', x: 381, y: 193, ox: 0, oy: 0, lines: [null, null] },
      { objId: 'someId1', x: 377, y: 319, ox: 0, oy: 0, lines: [null, null] },
      { objId: 'someId1', x: 502, y: 339, ox: 0, oy: 0, lines: [null, null] },
      { objId: 'someId1', x: 486, y: 179, ox: 0, oy: 0, lines: [null, null] },
      { objId: 'someId1', x: 396, y: 174, ox: 0, oy: 0, lines: [null, null] },
    ],
  },
  {
    objId: 'someId2',
    label: 'b',
    points: [
      { objId: 'someId2', x: 309, y: 142, ox: 0, oy: 0, lines: [null, null] },
      { objId: 'someId2', x: 277, y: 245, ox: 0, oy: 0, lines: [null, null] },
      { objId: 'someId2', x: 386, y: 300, ox: 0, oy: 0, lines: [null, null] },
      { objId: 'someId2', x: 395, y: 152, ox: 0, oy: 0, lines: [null, null] },
    ],
  },
  {
    objId: 'someId3',
    label: 'c',
    points: [
      { objId: 'someId3', x: 248, y: 91, ox: 0, oy: 0, lines: [null, null] },
      { objId: 'someId3', x: 203, y: 193, ox: 0, oy: 0, lines: [null, null] },
      { objId: 'someId3', x: 282, y: 232, ox: 0, oy: 0, lines: [null, null] },
      { objId: 'someId3', x: 329, y: 114, ox: 0, oy: 0, lines: [null, null] },
    ],
  },
  {
    objId: 'someId4',
    label: 'd',
    points: [
      { objId: 'someId4', x: 193, y: 54, ox: 0, oy: 0, lines: [null, null] },
      { objId: 'someId4', x: 138, y: 155, ox: 0, oy: 0, lines: [null, null] },
      { objId: 'someId4', x: 202, y: 185, ox: 0, oy: 0, lines: [null, null] },
      { objId: 'someId4', x: 258, y: 75, ox: 0, oy: 0, lines: [null, null] },
    ],
  },
  {
    objId: 'someId5',
    label: 'e',
    points: [
      { objId: 'someId5', x: 149, y: 30, ox: 0, oy: 0, lines: [null, null] },
      { objId: 'someId5', x: 78, y: 124, ox: 0, oy: 0, lines: [null, null] },
      { objId: 'someId5', x: 136, y: 142, ox: 0, oy: 0, lines: [null, null] },
      { objId: 'someId5', x: 205, y: 45, ox: 0, oy: 0, lines: [null, null] },
    ],
  },
  {
    objId: 'someId6',
    label: 'f',
    points: [
      { objId: 'someId6', x: 113, y: 4, ox: 0, oy: 0, lines: [null, null] },
      { objId: 'someId6', x: 48, y: 70, ox: 0, oy: 0, lines: [null, null] },
      { objId: 'someId6', x: 87, y: 97, ox: 0, oy: 0, lines: [null, null] },
      { objId: 'someId6', x: 166, y: 21, ox: 0, oy: 0, lines: [null, null] },
    ],
  },
];


  const aspectRatio = size.width / size.height;
  return (
    <div className={style.selectionWrapper} style={{ aspectRatio: aspectRatio }}>
      {children}
      <Selector
        width={String(size.width)}
        height={String(size.height)}
        viewBox={`0 0 ${size.width} ${size.height}`}
        initialSelections={initialSelections}
        editMode={editMode}
        changeMode={changeMode}
      />
    </div>
  );
}
