import React, { useState, useRef, useReducer, } from "react";
import { v4 as uuidv4 } from 'uuid';
import { calcRelCords } from './utils';
import styles from './selector.module.css'
import { DraggableSVGElement, DraggableGroup } from "./draggableElements";

export const editModeType = {
  CREATE: "CREATE",
  DELETE: "DELETE",
  MOVE: "MOVE",
  EDIT: "EDIT",
  BLOCK: "BLOCK"
}

const selectionActions = {
  CREATE_POLYGON: 'CREATE_POLYGON',
  DELETE_POLYGON: 'DELETE_POLYGON',
  DELETE_POINT: 'DELETE_POINT',
  ADD_POINT: 'ADD_POINT',
  MODIFY_POINT: 'MODIFY_POINT',
  MOVE_POLYGON: 'MOVE_POLYGON'
}

function createPoint(x, y) {
  return {
    id: uuidv4(),
    x: x,
    y: y,
    ox: x,
    oy: y
  }
}


function selectorReducer(state, action) {
  switch (action.type) {
    case selectionActions.ADD_POINT: {
      const i = action.i !== -1 ? action.i : state.selected.length - 1
      const j = action.j !== -1 ? action.j : state.selected[i].length
      const newArray = state.selected.map((innerArray) => [...innerArray])
      const point = { ...action.point, lines: [null, null] }
      if (i >= 0 && i < newArray.length && j >= 0 && j <= newArray[i].length) {
        newArray[i].splice(j, 0, point);
      } else {
        throw new Error('Invalid indices provided.')
      }
      return { ...state, selected: newArray };
    }

    case selectionActions.CREATE_POLYGON:
      let polygon = []
      if (action.polygon !== undefined) {
        polygon = action.polygon
      }
      return { ...state, selected: [...state.selected, polygon] }

    case selectionActions.DELETE_POLYGON: {
      const { i } = action;
      if (i >= 0 && i < state.selected.length) {
        const updatedSelected = [...state.selected.slice(0, i), ...state.selected.slice(i + 1)];
        return { ...state, selected: updatedSelected };
      } else {
        throw new Error('Invalid index provided for deleting polygon.');
      }
    }
  
    case selectionActions.MODIFY_POINT:
      const { id, x, y } = action;
      const modifiedSelected = state.selected.map((innerArray) => {
        return innerArray.map((point) => {
          if (point.id === id) {
            return {
              ...point,
              x,
              y,
            };
          }
          return point;
        });
      });
      return { ...state, selected: modifiedSelected };
    
    case selectionActions.DELETE_POINT: {
        const { id } = action;
        const updatedSelected = state.selected.map((innerArray) => {
          return innerArray.filter((point) => point.id !== id);
        });
        return { ...state, selected: updatedSelected };
      }
    
      case selectionActions.MOVE_POLYGON: {
        const { i, xoffset, yoffset } = action;
        if (i >= 0 && i < state.selected.length) {
          const movedPolygon = state.selected[i].map((point) => ({
            ...point,
            x: point.x + xoffset,
            y: point.y + yoffset,
          }));
          const updatedSelected = [...state.selected];
          updatedSelected[i] = movedPolygon;
          return { ...state, selected: updatedSelected };
        } else {
          throw new Error('Invalid index provided for moving polygon.');
        }
      }

    case selectionActions.DELETE_POLYGON:
      console.log('delete polygon')
    default:
      console.error('error')
      return state

  }
}

export default function SelectionCanvas({
  width = "100%",
  height = "100%",
  viewBox = "0 0 1000 1000",
  editMode,
  startingPoints = [],
  pointRadius = 7,
}) {
  const [selectedAreas, dispatchSelection] = useReducer(selectorReducer, { selected: startingPoints })
  const [isDrawingPolygon, setDrawingState] = useState(false)
  const incompleteLine = useRef(null)

  const svgRef = useRef(null)
  const lineProps = { stroke: 'white', strokeWidth: '10' }

  const updatePointPos = (x, y, id) => {
    dispatchSelection({
      type: selectionActions.MODIFY_POINT,
      id: id,
      x: x, y: y
    })
  }
  
  const updatePolygonPos = (xoffset, yoffset, i) => {
    dispatchSelection({
      type: selectionActions.MOVE_POLYGON,
      xoffset,
      yoffset,
      i: i,
    })
  }

  const moveLine = (x, y, lines) => {
    if (lines[0] !== null) {
      lines[0].setAttribute('x2', x + pointRadius)
      lines[0].setAttribute('y2', y + pointRadius)
    }
    if (lines[1] !== null) {
      lines[1].setAttribute('x1', x + pointRadius)
      lines[1].setAttribute('y1', y + pointRadius)
    }
  }

  const handleMouseMove = (e) => {
    if (isDrawingPolygon && incompleteLine.current !== null) {
      const newPos = calcRelCords({ x: e.clientX, y: e.clientY }, svgRef.current)
      incompleteLine.current.setAttribute('x2', newPos.x)
      incompleteLine.current.setAttribute('y2', newPos.y)
    }
  }

  const handleCanvasClick = (e) => {
    var { x, y } = calcRelCords({ x: e.clientX, y: e.clientY }, svgRef.current)
    x -= pointRadius
    y -= pointRadius
    if (e.button === 0 && editMode===editModeType.CREATE) {
      if (!isDrawingPolygon) {
        dispatchSelection({ type: selectionActions.CREATE_POLYGON })
        setDrawingState(true)
      }
      dispatchSelection({ type: selectionActions.ADD_POINT, i: -1, j: -1, point: createPoint(x, y) })
    }
  }

  const finishPolygon = (e) => {
    e.stopPropagation()
    setDrawingState(false)
  }

  const lines = []
  selectedAreas.selected.forEach((points, j) => {
    lines[j] = []
    points.forEach((point, i) => {
      var nextPoint = points[(i + 1) % points.length]
      var ref = null
      if ((i < points.length - 1) || !isDrawingPolygon || j < selectedAreas.selected.length - 1) {
        ref = (node) => {
          point.lines[1] = node
          nextPoint.lines[0] = node
        }
      } else if (isDrawingPolygon && i === points.length - 1) {
        nextPoint = point
        ref = incompleteLine
      }

      const line = (
        <line
          className={styles.line}
          {...lineProps}
          x1={point.x + pointRadius}
          y1={point.y + pointRadius}
          x2={nextPoint.x + pointRadius}
          y2={nextPoint.y + pointRadius}
          key={`line-${point.id}`}
          ref={ref}
        />
      )
      lines[j].push(line)
    })
  })

  const circles = []
  selectedAreas.selected.forEach((points, j) => {
    circles[j] = []
    points.forEach((point, i) => {
      var onMouseDown = (i === 0 && j === selectedAreas.selected.length - 1)
        ? finishPolygon
        : () => { }

      const element = editMode === editModeType.EDIT || editMode === editModeType.CREATE
      ? (
        <DraggableSVGElement key={point.id}
          svgRef={svgRef}
          onDragging={(x, y) => moveLine(x, y, point.lines)}
          onFinishDragging={(x, y) => updatePointPos(x, y, point.id)}
          initialCoordinates={{ x: point.x, y: point.y }}
        >
          <rect width={pointRadius * 2} height={pointRadius * 2} rx="15" onMouseDown={onMouseDown} />
        </DraggableSVGElement>
      )
      : <rect key={point.id} width={pointRadius * 2} height={pointRadius * 2} rx="15" onMouseDown={onMouseDown} x={point.x} y={point.y}/>
      circles[j].push(element)
    })
  })
  
  const modeClassMap = {
    [editModeType.DELETE]: styles.deleteMode,
    [editModeType.CREATE]: styles.createMode,
    [editModeType.BLOCK]: "",
    [editModeType.EDIT]: styles.editMode,
  } 
  
  const handlePolygonClick = (i) => {
    switch (editMode){
      case editModeType.DELETE:
          dispatchSelection({type: selectionActions.DELETE_POLYGON, i})
      default:
        break
    }
  }
  
  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      ref={svgRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleCanvasClick}
    >
      {circles.map((points, i)=>{
        return <DraggableGroup key={selectedAreas.selected[i][0].id} svgRef={svgRef} onFinishDragging={(diff) => updatePolygonPos(diff.x, diff.y, i)}
        isMovable={editMode === editModeType.EDIT}>
          <g key={selectedAreas.selected[i][0].id} className={styles.polygon+" "+modeClassMap[editMode]} onClick={() => handlePolygonClick(i)}>
            {lines[i]}
            {points}
          </g>
        </DraggableGroup>
      }
      )}
    </svg>
  )
}
