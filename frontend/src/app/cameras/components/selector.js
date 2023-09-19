import React, { useState, useRef, useReducer, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useDrag, calcRelCords } from './utils';
import styles from './selector.module.css'

function DraggableSvgElement({
  children,
  initialCoordinates = { x: 0, y: 0 },
  onStartDragging = () => { },
  onDragging = () => { },
  onFinishDragging = () => { },
  svgRef
}) {
  if (!React.isValidElement(children)) {
    throw new Error("DraggableComponent must have a single valid React element as its child.");
  }

  const objRef = useRef();

  const intermediateMovement = (x, y) => {
    const newPos = calcRelCords({ x, y }, svgRef.current);
    if (objRef.current !== null && svgRef.current !== null) {
      objRef.current.setAttribute("x", newPos.x);
      objRef.current.setAttribute("y", newPos.y);
      onDragging(newPos.x, newPos.y)
    }
  };

  const cvtPos = ({ x, y }) => {
    return calcRelCords({ x, y }, svgRef.current)
  }

  const [position, drag] = useDrag(initialCoordinates, intermediateMovement, cvtPos);

  useEffect(() => {
    onFinishDragging(position.x, position.y);
  }, [position]);

  return (
    React.cloneElement(children, {
      ...children.props,
      onMouseDown: (e) => {
        e.stopPropagation()
        onStartDragging(position.x, position.y);
        drag(e);
        if (children.props.onMouseDown !== undefined) {
          children.props.onMouseDown(e)
        }
      },
      x: position.x,
      y: position.y,
      ref: objRef,
    })
  );
};

const selectionActions = {
  CREATE_POLYGON: 'CREATE_POLYGON',
  DELETE_POLYGON: 'DELETE_POLYGON',
  ADD_POINT: 'ADD_POINT',
  MODIFY_POINT: 'MODIFY_POINT'
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

    case selectionActions.DELETE_POLYGON:
      console.log('delete polygon')
    default:
      console.error('error')
  }
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

export default function SelectionCanvas({
  width = "100%",
  height = "100%",
  viewBox = "0 0 1000 1000",
  startingPoints = [[]],
  pointRadius = 10,
}) {
  const [selectedAreas, dispatchSelection] = useReducer(selectorReducer, { selected: startingPoints })
  const [creationMode, setCreationMode] = useState(false)
  const incompleteLine = useRef(null)

  const svgRef = useRef(null)
  const lineProps = { stroke: 'white', strokeWidth: '10' }

  const updateState = (x, y, id) => {
    dispatchSelection({
      type: selectionActions.MODIFY_POINT,
      id: id,
      x: x, y: y
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
    if (creationMode && incompleteLine.current !== null) {
      const newPos = calcRelCords({ x: e.clientX, y: e.clientY }, svgRef.current)
      incompleteLine.current.setAttribute('x2', newPos.x)
      incompleteLine.current.setAttribute('y2', newPos.y)
    }
  }

  const handleCanvasClick = (e) => {
    var { x, y } = calcRelCords({ x: e.clientX, y: e.clientY }, svgRef.current)
    x -= pointRadius
    y -= pointRadius
    if (e.button === 1) {
      if (!creationMode) {
        dispatchSelection({ type: selectionActions.CREATE_POLYGON })
        setCreationMode(true)
      }
      dispatchSelection({ type: selectionActions.ADD_POINT, i: -1, j: -1, point: createPoint(x, y) })
    }
  }

  const finishPolygon = (e) => {
    e.stopPropagation()
    setCreationMode(false)
  }
  
  const lines = selectedAreas.selected.map((points, j) => {
    return points.map((point, i) => {
      var nextPoint = points[(i + 1) % points.length]
      var ref = null
      if ((i < points.length - 1) || !creationMode || j < selectedAreas.selected.length - 1) {
        ref = (node) => {
          point.lines[1] = node
          nextPoint.lines[0] = node
        }
      } else if (creationMode && i === points.length - 1) {
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

      return line
    })
  })
  const points = selectedAreas.selected.map((points, j) => {
    return points.map((point, i) => {
      var onMouseDown = (i === 0 && j === selectedAreas.selected.length - 1)
        ? finishPolygon
        : () => { }

      return (
        <DraggableSvgElement key={point.id}
          svgRef={svgRef}
          onDragging={(x, y) => moveLine(x, y, point.lines)}
          onFinishDragging={(x, y) => updateState(x, y, point.id)}
          initialCoordinates={{ x: point.ox, y: point.oy}}
        >
          <rect width={pointRadius * 2} fill="red" className={styles.point} height={pointRadius * 2} rx="15" onMouseDown={onMouseDown} />
        </DraggableSvgElement>
      )
    })
  })
  
  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      ref={svgRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleCanvasClick}
    >
      {lines}
      {points}
    </svg>
  )
}
