import React from 'react';
import useDraggable from './useDraggable';

function DraggableComponent() {
  const { position, onMouseDown } = useDraggable();

  return (
    <div
      style={{
        backgroundColor: 'black',
        width: '100px',
        height: '100px',
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={onMouseDown}
    ></div>
  );
}

export default DraggableComponent;