import React, { useState, useRef, useReducer } from "react";
import { v4 as uuidv4 } from 'uuid';
import { calcVBOXCoords } from './utils';
import styles from './selector.module.css'
import { DraggableSVGElement, DraggableGroup } from "./draggableElements";

/**
 * Enum representing different edit modes.
 * @readonly
 * @enum {string}
 */
export const editModeType = {
  CREATE: "CREATE",
  DELETE: "DELETE",
  MOVE: "MOVE",
  EDIT: "EDIT",
  BLOCK: "BLOCK"
}

/**
 * Enum representing different actions for polygon selection.
 * @readonly
 * @enum {string}
 */
const selectionActions = {
  CREATE_POLYGON: 'CREATE_POLYGON',
  DELETE_POLYGON: 'DELETE_POLYGON',
  DELETE_POINT: 'DELETE_POINT',
  ADD_POINT: 'ADD_POINT',
  MODIFY_POINT: 'MODIFY_POINT',
  MOVE_POLYGON: 'MOVE_POLYGON'
}

/**
 * Creates a point object with specified coordinates.
 * @param {number} x - The x-coordinate of the point.
 * @param {number} y - The y-coordinate of the point.
 * @returns {Object} - Point object with unique ID and original coordinates.
 */
function createPoint(x, y) {
  return {
    id: uuidv4(),
    x: x,
    y: y,
    ox: x,
    oy: y
  }
}

/**
 * Reducer function for handling state changes in the selector.
 * @param {Object} state - Current state.
 * @param {Object} action - Action object describing the state change.
 * @returns {Object} - New state.
 */
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

    case selectionActions.CREATE_POLYGON: {
      let polygon = []
      if (action.polygon !== undefined) {
        polygon = action.polygon
      }
      return { ...state, selected: [...state.selected, polygon] }
    }

    case selectionActions.DELETE_POLYGON: {
      const { i } = action;
      if (i >= 0 && i < state.selected.length) {
        const updatedSelected = [...state.selected.slice(0, i), ...state.selected.slice(i + 1)];
        return { ...state, selected: updatedSelected };
      } else {
        throw new Error('Invalid index provided for deleting polygon.');
      }
    }

    case selectionActions.MODIFY_POINT: {
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
    }

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

    default:
      return state

  }
}

/**
 * SelectionCanvas is a React component for drawing and interacting with polygons on an SVG canvas.
 * @param {Object} props - Component props.
 * @param {string} props.width - The width of the SVG canvas.
 * @param {string} props.height - The height of the SVG canvas.
 * @param {string} props.viewBox - The viewBox attribute for the SVG canvas.
 * @param {string} props.editMode - The current edit mode.
 * @param {Array} props.startingPoints - Initial points for drawing polygons.
 * @param {number} props.pointRadius - The radius of points on the canvas.
 * @returns {React.ReactElement} - SVG canvas for polygon selection.
 */
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

  /**
   * Updates the position of a point.
   * @param {number} x - The new x-coordinate.
   * @param {number} y - The new y-coordinate.
   * @param {string} id - The unique ID of the point.
   */
  const updatePointPos = (x, y, id) => {
    dispatchSelection({
      type: selectionActions.MODIFY_POINT,
      id: id,
      x: x, y: y
    })
  }

  /**
   * Updates the position of a polygon.
   * @param {number} xoffset - The horizontal offset.
   * @param {number} yoffset - The vertical offset.
   * @param {number} i - The index of the polygon in the selection.
   */
  const updatePolygonPos = (xoffset, yoffset, i) => {
    dispatchSelection({
      type: selectionActions.MOVE_POLYGON,
      xoffset,
      yoffset,
      i: i,
    })
  }

  /**
   * Moves the lines of a polygon while dragging a point.
   * @param {number} x - The x-coordinate of the dragged point.
   * @param {number} y - The y-coordinate of the dragged point.
   * @param {Array} lines - Array of lines associated with the dragged point.
   */
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

  /**
   * Handles mouse move events while drawing a polygon.
   * @param {Object} e - Mouse event object.
   */
  const handleMouseMove = (e) => {
    if (isDrawingPolygon && incompleteLine.current !== null) {
      const newPos = calcVBOXCoords({ x: e.clientX, y: e.clientY }, svgRef.current)
      incompleteLine.current.setAttribute('x2', newPos.x)
      incompleteLine.current.setAttribute('y2', newPos.y)
    }
  }

  /**
   * Handles mouse click events on the canvas.
   * @param {Object} e - Mouse event object.
   */
  const handleCanvasClick = (e) => {
    if (e.button === 0 && editMode === editModeType.CREATE) {
      var { x, y } = calcVBOXCoords({ x: e.clientX, y: e.clientY }, svgRef.current)
      x -= pointRadius
      y -= pointRadius
      if (!isDrawingPolygon) {
        dispatchSelection({ type: selectionActions.CREATE_POLYGON })
        setDrawingState(true)
      }
      dispatchSelection({ type: selectionActions.ADD_POINT, i: -1, j: -1, point: createPoint(x, y) })
    }
  }

  /**
   * Handles finishing the drawing of a polygon.
   * @param {Object} e - Mouse event object.
   */
  const finishPolygon = (e) => {
    e.stopPropagation()
    setDrawingState(false)
  }

  /**
   * Handles clicking on a polygon.
   * @param {number} i - Index of the clicked polygon.
   */
  const handlePolygonClick = (i) => {
    switch (editMode) {
      case editModeType.DELETE:
        dispatchSelection({ type: selectionActions.DELETE_POLYGON, i })
      default:
        break
    }
  }

  const modeClassMap = {
    [editModeType.DELETE]: styles.deleteMode,
    [editModeType.CREATE]: styles.createMode,
    [editModeType.BLOCK]: "",
    [editModeType.EDIT]: styles.editMode,
  }

  const linesAndCircles = selectedAreas.selected.map((points, j) => {
    const linesForArea = [];
    const circlesForArea = [];

    points.forEach((point, i) => {
      var nextPoint = points[(i + 1) % points.length];
      var ref = null;

      if ((i < points.length - 1) || !isDrawingPolygon || j < selectedAreas.selected.length - 1) {
        ref = (node) => {
          point.lines[1] = node;
          nextPoint.lines[0] = node;
        };
      } else if (isDrawingPolygon && i === points.length - 1) {
        nextPoint = point;
        ref = incompleteLine;
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
      );

      linesForArea.push(line);

      var onMouseDown = (i === 0 && j === selectedAreas.selected.length - 1)
        ? finishPolygon
        : () => { };

      const isMovable = [editModeType.EDIT, editModeType.CREATE].includes(editMode)
      const element =
        (
          <DraggableSVGElement key={point.id}
            svgRef={svgRef}
            onDragging={(x, y) => moveLine(x, y, point.lines)}
            onFinishDragging={(x, y) => updatePointPos(x, y, point.id)}
            initialCoordinates={{ x: point.x, y: point.y }}
            isMovable={isMovable}
          >
            <rect width={pointRadius * 2} height={pointRadius * 2} rx="15" onMouseDown={onMouseDown} />
          </DraggableSVGElement>
        )

      circlesForArea.push(element);
    });

    return { lines: linesForArea, circles: circlesForArea };
  });

  const lines = linesAndCircles.map(entry => entry.lines);
  const circles = linesAndCircles.map(entry => entry.circles);

  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      ref={svgRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleCanvasClick}
    >
      {circles.map((points, i) => {
        return <DraggableGroup key={selectedAreas.selected[i][0].id} svgRef={svgRef} onFinishDragging={(diff) => updatePolygonPos(diff.x, diff.y, i)}
          isMovable={editMode === editModeType.EDIT}>
          <g key={selectedAreas.selected[i][0].id} className={styles.polygon + " " + modeClassMap[editMode]} onClick={() => handlePolygonClick(i)}>
            {lines[i]}
            {points}
          </g>
        </DraggableGroup>
      }
      )}
    </svg>
  )
}
