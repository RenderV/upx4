import React, { useRef, useEffect, useLayoutEffect } from "react";
import { useDrag, calcVBOXCoords } from './utils';

/**
 * Adds a value to the specified attribute of an SVG node.
 * @param {SVGElement} node - The SVG element.
 * @param {string} attribute - The attribute to modify.
 * @param {number} value - The value to add.
 */
function addToAttribute(node, attribute, value){
  const oldValue = Number(node.getAttribute(attribute))
  node.setAttribute(attribute, oldValue + value)
}

/**
 * DraggableSVGElement is a component that makes an SVG element draggable.
 * @param {Object} props - Component props.
 * @param {React.ReactElement} props.children - The child element to make draggable.
 * @param {Object} props.initialCoordinates - Initial x and y coordinates.
 * @param {number} props.initialCoordinates.x - Initial x-coordinate.
 * @param {number} props.initialCoordinates.y - Initial y-coordinate.
 * @param {boolean} props.isMovable - Flag to enable or disable dragging.
 * @param {function} props.onStartDragging - Callback function when dragging starts.
 * @param {function} props.onDragging - Callback function during dragging.
 * @param {function} props.onFinishDragging - Callback function when dragging finishes.
 * @param {React.RefObject} props.svgRef - Reference to the SVG element.
 * @returns {React.ReactElement} - Draggable SVG element.
 */
export function DraggableSVGElement({
  children,
  initialCoordinates = { x: 0, y: 0 },
  isMovable,
  onStartDragging = () => { },
  onDragging = () => { },
  onFinishDragging = () => { },
  svgRef
}) {
  if (!React.isValidElement(children)) {
    throw new Error("DraggableComponent must have a single valid React element as its child.");
  }

  const objRef = useRef();

  /**
   * Handles intermediate movement during dragging.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   */
  const intermediateMovement = (x, y) => {
    if (isMovable) {
      const newPos = calcVBOXCoords({ x, y }, svgRef.current);
      if (objRef.current !== null && svgRef.current !== null) {
        objRef.current.setAttribute("x", newPos.x);
        objRef.current.setAttribute("y", newPos.y);
        onDragging(newPos.x, newPos.y);
      }
    }
  };

  /**
   * Converts coordinates to SVG viewbox coordinates.
   * @param {Object} param - Object with x and y coordinates.
   * @param {number} param.x - The x-coordinate.
   * @param {number} param.y - The y-coordinate.
   * @returns {Object} - Object with converted x and y coordinates.
   */
  const cvtPos = ({ x, y }) => {
    return calcVBOXCoords({ x, y }, svgRef.current);
  };

  const [position, drag] = useDrag(initialCoordinates, intermediateMovement, cvtPos);

  useEffect(() => {
    if (isMovable) {
      onFinishDragging(position.x, position.y);
    }
  }, [position]);

  return (
    React.cloneElement(children, {
      ...children.props,
      onMouseDown: (e) => {
        if (isMovable) {
          e.stopPropagation();
          onStartDragging(position.x, position.y);
          drag(e);
          if (children.props.onMouseDown !== undefined) {
            children.props.onMouseDown(e);
          }
        }
      },
      x: position.x,
      y: position.y,
      ref: objRef,
    })
  );
};

/**
 * DraggableGroup is a component that makes a group of SVG elements draggable as a whole.
 * @param {Object} props - Component props.
 * @param {React.ReactElement} props.children - The child element (SVG group) to make draggable.
 * @param {function} props.onStartDragging - Callback function when dragging starts.
 * @param {function} props.onDragging - Callback function during dragging.
 * @param {function} props.onFinishDragging - Callback function when dragging finishes.
 * @param {boolean} props.isMovable - Flag to enable or disable dragging.
 * @param {React.RefObject} props.svgRef - Reference to the SVG element.
 * @returns {React.ReactElement} - Draggable SVG group.
 */
export function DraggableGroup({
  children,
  onStartDragging = () => { },
  onDragging = () => { },
  onFinishDragging = () => { },
  isMovable = true,
  svgRef
}) {
  if (!React.isValidElement(children)) {
    throw new Error("DraggableComponent must have a single valid React element as its child.");
  }
  
  const objRef = useRef();
  const lastPos = useRef(null);

  /**
   * Converts coordinates to SVG viewbox coordinates.
   * @param {Object} param - Object with x and y coordinates.
   * @param {number} param.x - The x-coordinate.
   * @param {number} param.y - The y-coordinate.
   * @returns {Object} - Object with converted x and y coordinates.
   */
  const cvtPos = ({ x, y }) => {
    return calcVBOXCoords({ x, y }, svgRef.current);
  };

  /**
   * Handles intermediate movement during dragging.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   */
  const intermediateMovement = (x, y) => {
    if (isMovable) {
      const newPos = calcVBOXCoords({ x, y }, svgRef.current);
      if (objRef.current !== null && svgRef.current !== null) {
        onDragging(newPos.x, newPos.y);
        const bbox = objRef.current.getBoundingClientRect();
        const { x: ox, y: oy } = cvtPos(bbox);
        const diff = { x: newPos.x - ox, y: newPos.y - oy };
        Array.from(objRef.current.children).forEach((child) => {
          if (child.tagName === "rect") {
            addToAttribute(child, "x", diff.x);
            addToAttribute(child, "y", diff.y);
          } else if (child.tagName === "line") {
            addToAttribute(child, "x1", diff.x);
            addToAttribute(child, "x2", diff.x);
            addToAttribute(child, "y1", diff.y);
            addToAttribute(child, "y2", diff.y);
          }
        });
      }
    }
  };

  const [position, drag] = useDrag({ x: null, y: null }, intermediateMovement, cvtPos);
  
  useLayoutEffect(() => {
    if (position.x !== null && position.y !== null && isMovable && lastPos.current.x !== null && lastPos.current.y !== null) {
      const newPos = position;
      const diff = { x: newPos.x - lastPos.current.x, y: newPos.y - lastPos.current.y };
      onFinishDragging(diff);
    }
  }, [position]);

  return (
    React.cloneElement(children, {
      ...children.props,
      ref: objRef,
      onMouseDown: (e) => {
        if (isMovable) {
          lastPos.current = cvtPos(objRef.current.getBoundingClientRect());
          e.stopPropagation();
          onStartDragging(position.x, position.y);
          drag(e);
          if (children.props.onMouseDown !== undefined) {
            children.props.onMouseDown(e);
          }
        }
      },
    })
  );
};
