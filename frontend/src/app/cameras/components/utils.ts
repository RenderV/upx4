import { MouseEventHandler, Coords2D, Point, GenericMap, SelectionContextType, EditMode } from "../types";
import { useState, createContext, useContext } from "react";
import { v4 as uuidv4 } from 'uuid';
import { RefObject } from "react";

export const mapRange = (
    n: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number => {
    return ((n - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

export const calcVBOXCoords = (
    { x, y }: Coords2D,
    svgNode: SVGSVGElement | null
): Coords2D => {
    if (typeof x !== 'number' || typeof y !== 'number') {
        throw new Error("X and Y must be numbers: " + x + ", " + y);
    }

    if (svgNode !== null) {
        const bbox = svgNode.getBoundingClientRect()
        const { x: xmin, y: ymin, width: viewBoxWidth, height: viewBoxHeight } = (svgNode).viewBox.animVal

        if (!(viewBoxWidth == 0 && viewBoxHeight == 0)) {
            let innerOffsetX = 0
            let innerOffsetY = 0

            const vRatio = viewBoxWidth / viewBoxHeight
            const bRatio = bbox.width / bbox.height

            if (bRatio > vRatio) {
                const scale = viewBoxHeight / bbox.height
                const Cw = scale * bbox.width
                innerOffsetX = (Cw - viewBoxWidth) / 2
            } else if (bRatio < vRatio) {
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
    x = Math.round(x)
    y = Math.round(y)
    return { x, y }
};

export const bboxToImageCoords = (
    { x, y }: Coords2D,
    {imgWidth, imgHeight}: {imgWidth: number, imgHeight: number},
    svgNode: SVGSVGElement | null
): Coords2D => {

    if (svgNode !== null) {
        const bbox = svgNode.getBoundingClientRect()
        const { x: xmin, y: ymin, width: viewBoxWidth, height: viewBoxHeight } = (svgNode).viewBox.animVal

        if (!(viewBoxWidth == 0 && viewBoxHeight == 0)) {
            let innerOffsetX = 0
            let innerOffsetY = 0

            const vRatio = viewBoxWidth / viewBoxHeight
            const bRatio = bbox.width / bbox.height

            if (bRatio > vRatio) {
                const scale = viewBoxHeight / bbox.height
                const Cw = scale * bbox.width
                innerOffsetX = (Cw - viewBoxWidth) / 2
            } else if (bRatio < vRatio) {
                const scale = viewBoxWidth / bbox.width
                const Ch = scale * bbox.height
                innerOffsetY = (Ch - viewBoxHeight) / 2
            }

            x = mapRange(
                x, // x in bbox
                xmin - innerOffsetX, // min x in the svg viewBox
                viewBoxWidth + innerOffsetX, // max x in the svg viewBox
                0, // min x in img
                imgWidth // max x in img
            )
            y = mapRange(
                y, // y in bbox
                ymin - innerOffsetY, // min y in the svg viewBox
                viewBoxHeight + innerOffsetY, // max y in the svg viewBox
                0, // min y in img
                imgHeight // max y in img
            )

        } else {
            throw new Error("ViewBox width and height must be greater than 0")
        }
    }
    x = Math.round(x)
    y = Math.round(y)
    return { x, y }
};

export const calcScreenCoords = (
    { x, y }: Coords2D,
    svgRef: RefObject<SVGSVGElement>
): Coords2D => {
    if (svgRef !== null && svgRef.current !== null) {
        const bbox = svgRef.current.getBoundingClientRect()
        const { x: xmin, y: ymin, width: w, height: h } = svgRef.current.viewBox.animVal

        if (!(w == 0 && h == 0)) {
            let innerOffsetX = 0
            let innerOffsetY = 0

            const vRatio = w / h
            const bRatio = bbox.width / bbox.height

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
    x = Math.round(x)
    y = Math.round(y)
    return { x, y }
};

export function useDrag(
    initialPosition: Coords2D,
    updatePosition: ({ x, y }: Coords2D) => void,
    customConv: ({ x, y }: Coords2D) => Coords2D = ({ x, y }) => ({ x, y })
): [Coords2D, MouseEventHandler] {
    const [position, setPosition] = useState<Coords2D>(initialPosition)

    const onMouseDown: MouseEventHandler = (e) => {
        const box = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const offsetX = e.clientX - box.left
        const offsetY = e.clientY - box.top

        const onMouseMove = (e: MouseEvent) => {
            const x = e.clientX - offsetX
            const y = e.clientY - offsetY
            updatePosition({ x, y })
        };

        const onMouseUp = (e: MouseEvent) => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
            setPosition(
                customConv({
                    x: e.clientX - offsetX,
                    y: e.clientY - offsetY,
                })
            );
        };

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
    };

    return [position, onMouseDown];
}

export function createRelMovementHandler(
    movementStartCallback: ({ x, y }: Coords2D) => void,
    intermediateMovementCallback: ({ x, y }: Coords2D) => void,
    stateChangeCallback: (totalMovement: Coords2D) => void,
    customConv: ({ x, y }: Coords2D) => Coords2D = ({ x, y }) => ({ x, y }),
): MouseEventHandler {

    const onMouseDown: MouseEventHandler = (e) => {
        const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const offsetX = e.clientX - box.left
        const offsetY = e.clientY - box.top
        const oldPos = customConv({
            x: e.clientX - offsetX,
            y: e.clientY - offsetY
        })
        var lastMovingPos = oldPos
        movementStartCallback(oldPos)

        const onMouseMove = (e: MouseEvent) => {
            const coords = {
                x: e.clientX - offsetX,
                y: e.clientY - offsetY
            }
            const cvtCoords = customConv(coords)
            const diff = {
                x: cvtCoords.x - lastMovingPos.x,
                y: cvtCoords.y - lastMovingPos.y
            }
            intermediateMovementCallback(diff)
            lastMovingPos = cvtCoords
        };

        const onMouseUp = (e: MouseEvent) => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
            const coords = {
                x: e.clientX - offsetX,
                y: e.clientY - offsetY
            }
            const cvtCoords = customConv(coords)
            const diff = {
                x: cvtCoords.x - oldPos.x,
                y: cvtCoords.y - oldPos.y
            }
            stateChangeCallback(diff)
        };

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
    };

    return onMouseDown;
}

export function addToAttribute(element: Element, attributeName: string, value: number): void {
    const oldValue = Number(element.getAttribute(attributeName))
    element.setAttribute(attributeName, String(oldValue + value))
}

export function addToPoint(point: Point, { x, y }: Coords2D): Point {
    return {
        ...point,
        x: point.x + x,
        y: point.y + y,
    };
}

export function imperativeMoveSiblings(distance: Coords2D, node?: Element | null) {

    if (!node) return
    if (!node.parentElement) {
        throw Error("Element must have a parent element")
    }

    const attributeMap: GenericMap<{ x: string[], y: string[] }> = {
        "line": {
            "x": ["x1", "x2"],
            "y": ["y1", "y2"]
        },
        "foreignobject": {
            "x": ["x"],
            "y": ["y"]
        },
        "rect": {
            "x": ["x"],
            "y": ["y"]
        }
    };

    const siblings = Array.from(node.parentElement.childNodes);

    siblings.forEach((sibling) => {
        if (sibling.isSameNode(node)) return
        if (sibling instanceof Element) {
            const siblingTagName = sibling.tagName.toLowerCase();
            const attributeInfo = attributeMap[siblingTagName];

            if (attributeInfo) {
                if (distance.x !== 0) {
                    attributeInfo.x.forEach((attribute) => {
                        addToAttribute(sibling, attribute, distance.x);
                    });
                }

                if (distance.y !== 0) {
                    attributeInfo.y.forEach((attribute) => {
                        addToAttribute(sibling, attribute, distance.y);
                    });
                }
            }
        }
    });
}

export function createPoint(coord: Coords2D): Point {
    return {
        objId: uuidv4(),
        x: coord.x,
        y: coord.y,
        ox: coord.x,
        oy: coord.y,
        lines: [null, null]
    }
}

const SelectionContext = createContext<SelectionContextType>({ SVGRef: null, editMode: EditMode.DEFAULT, changeMode: (mode) => { } })
export const SelectionContextProvider = SelectionContext.Provider
export const useSelectionContext = () => {
    const selectionContext = useContext(SelectionContext)
    return selectionContext
}
