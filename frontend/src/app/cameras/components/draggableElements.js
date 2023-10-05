import React, { useRef, useEffect, useLayoutEffect } from "react";
import { useDrag, calcRelCords } from './utils';

function addToAttribute(node, attribute, value){
  const oldValue = Number(node.getAttribute(attribute))
  node.setAttribute(attribute, oldValue+value)
}

export function DraggableSVGElement({
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

export function DraggableGroup({
  children,
  onStartDragging = () => { },
  onDragging = () => { },
  onFinishDragging = () => { },
  isMovable=true,
  svgRef
}) {
  if (!React.isValidElement(children)) {
    throw new Error("DraggableComponent must have a single valid React element as its child.");
  }
  
  const objRef = useRef();
  const lastPos = useRef(null)

  const cvtPos = ({ x, y }) => {
    return calcRelCords({ x, y }, svgRef.current)
  }

  const intermediateMovement = (x, y) => {
    if(isMovable){
      const newPos = calcRelCords({ x, y }, svgRef.current);
      if (objRef.current !== null && svgRef.current !== null) {
        onDragging(newPos.x, newPos.y)
        const bbox = objRef.current.getBoundingClientRect()
        const {x: ox, y: oy} = cvtPos(bbox)
        const diff = {x: newPos.x - ox, y: newPos.y - oy}
        Array.from(objRef.current.children).forEach((child) => {
          if(child.tagName === "rect"){
            addToAttribute(child, "x", diff.x)
            addToAttribute(child, "y", diff.y)
          } else if (child.tagName === "line"){
            addToAttribute(child, "x1", diff.x)
            addToAttribute(child, "x2", diff.x)
            addToAttribute(child, "y1", diff.y)
            addToAttribute(child, "y2", diff.y)
          }
        })
      }
    }
  };

  const [position, drag] = useDrag({x: null, y: null}, intermediateMovement, cvtPos);
  
  useLayoutEffect(() => {
    if(position.x !== null && position.y !== null && isMovable && lastPos.current.x !== null && lastPos.current.y !== null){
      const newPos = position;
      const diff = {x: newPos.x - lastPos.current.x, y: newPos.y - lastPos.current.y}
      onFinishDragging(diff);
    }
  }, [position]);

  return (
    React.cloneElement(children, {
      ...children.props,
      ref: objRef,
      onMouseDown: (e) => {
        if(isMovable){
          lastPos.current = cvtPos(objRef.current.getBoundingClientRect())
          e.stopPropagation()
          onStartDragging(position.x, position.y);
          drag(e);
          if (children.props.onMouseDown !== undefined) {
            children.props.onMouseDown(e)
          }
        }
      },
    })
  );
};