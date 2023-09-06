'use client'
import React, { useRef, useState, useReducer, useLayoutEffect } from "react";
import styles from './draggable.module.css'

// custom hook used to enable drg functionality on an element
export function useDraggable(initialPosition = {x: 0, y: 0}) {
  const [position, setPosition] = useState(initialPosition);

  const onMouseDown = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - box.left;
    const offsetY = e.clientY - box.top;

    const onMouseMove = (event) => {
      setPosition({
        x: event.clientX - offsetX,
        y: event.clientY - offsetY,
      });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return [
    position,
    onMouseDown,
  ];

}

// This component wraps another component and makes it draggable
export function DraggableComponent({ children, initialCoordinates={x: 0, y: 0}}) {
  if (!React.isValidElement(children)) {
    throw new Error("DraggableComponent must have a single valid React element as its child.");
  }

  const [position, onMouseDown] = useDraggable(initialCoordinates);

  return React.cloneElement(children, {
    onMouseDown: onMouseDown,
    style: {
      left: `${position.x}px`,
      top: `${position.y}px`,
      ...children.props.style
    },
  });
}

const DraggableSvgElement = React.forwardRef(({ children, initialCoordinates = { x: 0, y: 0 } }, ref) => {
  if (!React.isValidElement(children)) {
    throw new Error("DraggableComponent must have a single valid React element as its child.");
  }

  const mapRange = (n, inMin, inMax, outMin, outMax) => {
    return (n - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  }

  const calcRelCords = ({ x, y }) => {
    if (ref.current !== null) {
      const viewBox = ref.current.getAttribute('viewBox');
      const bbox = ref.current.getBoundingClientRect();

      if (viewBox !== null) {
        var [xmin, ymin, w, h] = viewBox.split(' ').map((a) => Number(a));
        var innerOffsetX = 0
        var innerOffsetY = 0
        
        const vRatio  = w/h
        const bRatio = bbox.width/bbox.height;

        if(bRatio > vRatio){
              const scale = h/bbox.height
              const Cw = scale*bbox.width
              innerOffsetX = (Cw-w)/2
        } else if (bRatio < vRatio){
              const scale = w/bbox.width
              const Ch = scale*bbox.height
              innerOffsetY = (Ch-h)/2
        }
        x -= bbox.x
        y -= bbox.y
        x = mapRange(x, 0, bbox.width, xmin-innerOffsetX, w+innerOffsetX)
        y = mapRange(y, 0, bbox.height, ymin-innerOffsetY, h+innerOffsetY)
      } else {
        x -= bbox.x
        y -= bbox.y
      }
    }
    x = Math.round(x);
    y = Math.round(y);
    return { x, y };
  };


  const [position, onMouseDown] = useDraggable(initialCoordinates);
  const { x, y } = calcRelCords(position);

  return (
      React.cloneElement(children, {
        style: {
          ...children.props.style,
        },
        onMouseDown: onMouseDown,
        x: x,
        y: y
      })
  );
});

DraggableSvgElement.displayName = 'DraggableSvgElement'


function Polygon({points}){
}

export default function Selection() {
  const ref = useRef(null);
  return (
    <div className={styles.selection_area}>
      <svg width={'100%'} height={'100%'} style={{backgroundColor: 'pink'}} viewBox="0 0 1000 1000" ref={ref}>
        <DraggableSvgElement ref={ref}>
          <rect x="10" y="10" width="80" height="80" fill="black" />
        </DraggableSvgElement>
        <DraggableSvgElement ref={ref}>
          <rect x="20" y="20" width="80" height="80" fill="black" />
        </DraggableSvgElement>
      </svg>
    </div>
  );
}
