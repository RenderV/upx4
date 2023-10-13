'use client'
import { useState } from "react";

/**
 * Maps a value from one range to another.
 * @param {number} n - The input value.
 * @param {number} inMin - Minimum value of the input range.
 * @param {number} inMax - Maximum value of the input range.
 * @param {number} outMin - Minimum value of the output range.
 * @param {number} outMax - Maximum value of the output range.
 * @returns {number} - The mapped value.
 */
export const mapRange = (n, inMin, inMax, outMin, outMax) => {
  return (n - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
 * Converts screen coordinates to coordinates inside the SVG viewbox.
 * @param {Object} param - Object with x and y coordinates.
 * @param {number} param.x - The x-coordinate on the screen.
 * @param {number} param.y - The y-coordinate on the screen.
 * @param {HTMLElement} svgNode - Reference to the SVG element.
 * @returns {Object} - Object with converted x and y coordinates.
 */
export const calcVBOXCoords = ({ x, y }, svgNode) => {
    // Input validation
    if (typeof(x) !== 'number' || typeof(y) !== 'number') {
      throw new Error("X and Y must be numbers: ", x, y)
    }
    
    if (svgNode !== null) {
      const bbox = svgNode.getBoundingClientRect();
      var {x: xmin, y: ymin, width: viewBoxWidth, height: viewBoxHeight} = svgNode.viewBox.animVal

      // Check if the viewbox is defined
      if (!(viewBoxWidth == 0 && viewBoxHeight == 0)) {
        var innerOffsetX = 0
        var innerOffsetY = 0
        
        const vRatio  = viewBoxWidth / viewBoxHeight
        const bRatio = bbox.width / bbox.height;

        if (bRatio > vRatio) {
          // the x-axis will have a bigger range than the viewbox
          const scale = viewBoxHeight / bbox.height
          const Cw = scale * bbox.width
          innerOffsetX = (Cw - viewBoxWidth) / 2
        } else if (bRatio < vRatio) {
          // the y-axis will have a bigger range than the viewbox
          const scale = viewBoxWidth / bbox.width
          const Ch = scale * bbox.height
          innerOffsetY = (Ch - viewBoxHeight) / 2
        }
        x -= bbox.x
        y -= bbox.y
        x = mapRange(x, 0, bbox.width, xmin - innerOffsetX, viewBoxWidth + innerOffsetX)
        y = mapRange(y, 0, bbox.height, ymin - innerOffsetY, viewBoxHeight + innerOffsetY)

      } else {
        x -= bbox.x
        y -= bbox.y
      }
    }
    x = Math.round(x);
    y = Math.round(y);
    return { x, y };
};

/**
 * Converts coordinates inside the SVG viewbox to screen coordinates.
 * @param {Object} param - Object with x and y coordinates.
 * @param {number} param.x - The x-coordinate inside the viewbox.
 * @param {number} param.y - The y-coordinate inside the viewbox.
 * @param {React.RefObject} svgRef - Reference to the SVG element.
 * @returns {Object} - Object with converted x and y coordinates.
 */
export const calcScreenCoords = ({ x, y }, svgRef) => {
  if (svgRef!== null) {
    const bbox = svgRef.getBoundingClientRect();
    var {x: xmin, y: ymin, width: w, height: h} = svgRef.viewBox.animVal

    if (!(w == 0 && h == 0)) {
      var innerOffsetX = 0
      var innerOffsetY = 0
      
      const vRatio  = w / h
      const bRatio = bbox.width / bbox.height;

      if (bRatio > vRatio) {
        const scale = h / bbox.height
        const Cw = scale * bbox.width
        innerOffsetX = (Cw - w) / 2
      } else if (bRatio < vRatio) {
        const scale = w / bbox.width
        const Ch = scale * bbox.height
        innerOffsetY = (Ch - h) / 2
      }
      x = mapRange(x, xmin - innerOffsetX, w + innerOffsetX, 0, bbox.width)
      y = mapRange(y, ymin - innerOffsetY, h + innerOffsetY, 0, bbox.height)

    }
  }
  x = Math.round(x);
  y = Math.round(y);
  return { x, y };
};

/**
 * Custom hook for handling draggable elements.
 * @param {Object} initialPosition - Initial x and y coordinates.
 * @param {number} initialPosition.x - Initial x-coordinate.
 * @param {number} initialPosition.y - Initial y-coordinate.
 * @param {function} updatePosition - Function to update the position.
 * @param {function} customConv - Custom conversion function for position.
 * @returns {Array} - Array containing position object and mouse down handler.
 */
export function useDrag(initialPosition = { x: null, y: null }, updatePosition, customConv = ({ x, y }) => ({ x, y })) {
  const [position, setPosition] = useState(initialPosition);

  /**
   * Handles the mouse down event for dragging.
   * @param {Event} e - The mouse down event.
   */
  const onMouseDown = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - box.left;
    const offsetY = e.clientY - box.top;

    const onMouseMove = (e) => {
      updatePosition(
          e.clientX - offsetX,
          e.clientY - offsetY,
      );
    };
    
    const onMouseUp = (e) => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setPosition(customConv({
        x: e.clientX - offsetX,
        y: e.clientY - offsetY,
      }));
      setPosition(customConv({
        x: e.clientX - offsetX,
        y: e.clientY - offsetY,
      }));
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return [
    position,
    onMouseDown,
  ];
}