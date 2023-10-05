'use client'
import { useState } from "react";

export const mapRange = (n, inMin, inMax, outMin, outMax) => {
  return (n - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

// TODO: rewrite everything with a better performance

// This function is used to calculate the relative coordinates of a subelement inside an SVG element
// It assumes that the preserveAspectRatio attribute of the parent SVG element is set to its default value.
// When the aspect ratio of the viewBox and the aspect ratio of the svg element don't match,
// coordinates outside of the viewbox's range are displayed along an axis 
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio


export const calcRelCords = ({ x, y }, svgNode) => {
    if(typeof(x) !== 'number'  || typeof(y) !== 'number'){
      throw new Error("X and Y aren't numbers: ", x, y)
    }
    if (svgNode !== null) {
      const bbox = svgNode.getBoundingClientRect();
      var {x: xmin, y: ymin, width: viewBoxWidth, height: viewBoxHeight} = svgNode.viewBox.animVal

      // w and h are set to zero when the viewbox is not defined
      if (!(viewBoxWidth == 0 && viewBoxHeight == 0)) {
        var innerOffsetX = 0
        var innerOffsetY = 0
        
        const vRatio  = viewBoxWidth/viewBoxHeight
        const bRatio = bbox.width/bbox.height;

        if(bRatio > vRatio){
              // the x axis will have a bigger range than the viewbox
              const scale = viewBoxHeight/bbox.height
              const Cw = scale*bbox.width
              innerOffsetX = (Cw-viewBoxWidth)/2
        } else if (bRatio < vRatio){
              // the y axis will have a bigger range than the viewbox
              const scale = viewBoxWidth/bbox.width
              const Ch = scale*bbox.height
              innerOffsetY = (Ch-viewBoxHeight)/2
        }
        x -= bbox.x
        y -= bbox.y
        x = mapRange(x, 0, bbox.width, xmin-innerOffsetX, viewBoxWidth+innerOffsetX)
        y = mapRange(y, 0, bbox.height, ymin-innerOffsetY, viewBoxHeight+innerOffsetY)

      } else {
        x -= bbox.x
        y -= bbox.y
      }
    }
    x = Math.round(x);
    y = Math.round(y);
    return { x, y };
};

export const calcAbsCords = ({ x, y }, svgRef) => {
  if (svgRef!== null) {
    const bbox = svgRef.getBoundingClientRect();
    var {x: xmin, y: ymin, width: w, height: h} = svgRef.viewBox.animVal

    if (!(w == 0 && h == 0)) {
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
      x = mapRange(x, xmin-innerOffsetX, w+innerOffsetX, 0, bbox.width)
      y = mapRange(y, ymin-innerOffsetY, h+innerOffsetY, 0, bbox.height)

    }
  }
  x = Math.round(x);
  y = Math.round(y);
  return { x, y };
};


// custom hook used to enable drag functionality on an element
// it calls updatePosition to move the object and update the state (causing a rerender) when the mouse button is released.

export function useDrag(initialPosition = {x: null, y: null}, updatePosition, customConv=({x, y})=>{x, y}) {
  const [position, setPosition] = useState(initialPosition);

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
      window.removeEventListener('touchmove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setPosition(customConv({
        x: e.clientX - offsetX,
        y: e.clientY - offsetY,
      }));
      window.removeEventListener('touchend', onMouseUp);
      setPosition(customConv({
        x: e.clientX - offsetX,
        y: e.clientY - offsetY,
      }));
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onMouseUp);
  };

  return [
    position,
    onMouseDown,
  ];

}