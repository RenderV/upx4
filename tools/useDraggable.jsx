import { useState, useEffect } from 'react';

function useDraggable() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

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
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return {
    position,
    onMouseDown,
  };
}

export default useDraggable;