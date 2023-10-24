import React, { MouseEventHandler, createContext, useContext, useReducer } from 'react';
import { RefObject, useEffect, useRef, useState } from 'react';
import { Coords2D, Point, SelectionType, SVGPointProps, SVGSelectorProps, SVGSelectionProps, SVGLineProps, MovableSVGElementProps, LineType, CoordEventHandler, GenericMap, SelectionContextType, EditMode, ModeMapType, LabelProps } from "../types"
import { calcVBOXCoords, createRelMovementHandler, addToAttribute, addToPoint, imperativeMoveSiblings, createPoint } from './utils';
import { Chip } from '@mui/material';
import LabelModal from './labelmodal';
import styles from "./selector.module.css"

export const SelectionContext = createContext<SelectionContextType | null>(null)

export const modeMap: ModeMapType = {
    [EditMode.DEFAULT]: {
        allowedActions: ["VIEW", "VIEW_MOVEMENT"],
        shortcuts: ["Escape", "b", "5"]
    },
    [EditMode.ADD]: {
        allowedActions: ["VIEW", "SELECTION_MOVEMENT", "SELECTION_CREATION"],
        shortcuts: ["a", "1"]
    },
    [EditMode.EDIT]: {
        allowedActions: ["VIEW", "VIEW_MOVEMENT", "SELECTION_MOVEMENT"],
        shortcuts: ["e", "2"]
    },
    [EditMode.DELETE]: {
        allowedActions: ["VIEW", "VIEW_MOVEMENT", "SELECTION_DELETION"],
        shortcuts: ["d", "3"]
    },
    [EditMode.HIDE]: {
        allowedActions: ["VIEW_MOVEMENT"],
        shortcuts: ["h", "4"]
    },
};


export const MovableSVGElement = (
    {
        children,
        refCallback,
        coords,
        onStartMoving,
        onMove,
        onFinishMoving,
        allowMovement,
        Xattributes,
        Yattributes,
        onMouseDown,
        propagate = false,
    }: MovableSVGElementProps) => {

    const [position, setPosition] = useState<Array<Coords2D>>(coords)
    const elRef = useRef<Element | null>(null)
    const svgParent = useContext(SelectionContext)?.SVGRef
    if (!svgParent)
        throw new Error("svg parent must have a valid ref")

    useEffect(() => {
        setPosition(coords)
    }, [coords])

    if (coords.length !== Xattributes.length || coords.length !== Yattributes.length)
        throw new Error("Arguments Xattributes, Yattributes and coords don't have the same length")


    const cvtPos = (coords: Coords2D) => calcVBOXCoords(coords, svgParent.current)

    const handleStartPosition = (totalMovement: Coords2D) => {
        if (typeof onStartMoving !== 'undefined') {
            onStartMoving(totalMovement, elRef.current)
        }
    }
    const handleInBetweenPosUpdates = (totalMovement: Coords2D) => {
        if (!allowMovement) return

        const elementNode = elRef.current
        const svgParentNode = svgParent.current
        if (svgParentNode && elementNode) {
            Xattributes.forEach((attributeName) => {
                addToAttribute(elementNode, attributeName, totalMovement.x)
            })
            Yattributes.forEach((attributeName) => {
                addToAttribute(elementNode, attributeName, totalMovement.y)
            })
            if (onMove)
                onMove(totalMovement, elRef.current)
        }
    }
    const handleFinalPosUpdate = (totalMovement: Coords2D) => {
        if (!allowMovement) return
        const updatedPositions = position.map((pos) => ({
            x: pos.x + totalMovement.x,
            y: pos.y + totalMovement.y
        }));
        if (typeof onFinishMoving !== 'undefined')
            if (onFinishMoving)
                onFinishMoving(totalMovement, elRef.current)
        setPosition(updatedPositions)
    };


    const handleMouseDown = createRelMovementHandler(
        handleStartPosition,
        handleInBetweenPosUpdates,
        handleFinalPosUpdate,
        cvtPos
    )

    const positionProps: GenericMap<number> = {}

    Xattributes.forEach((attributeName, i) => {
        positionProps[attributeName] = position[i].x
    })
    Yattributes.forEach((attributeName, i) => {
        positionProps[attributeName] = position[i].y
    })

    return (
        React.cloneElement(children, {
            ...children.props,
            ...positionProps,
            onMouseDown: (e: React.MouseEvent) => {
                if (!propagate)
                    e.stopPropagation()
                handleMouseDown(e);
                if (onMouseDown) onMouseDown({ x: e.clientX, y: e.clientY })
            },
            ref: (node: Element) => {
                elRef.current = node
                if (refCallback) refCallback(node)
            }
        })
    )
}

export function SelectorPoint({
    point,
    onStartMoving,
    onMove,
    onFinishMoving,
    onMouseDown,
    allowMovement,
}: SVGPointProps) {
    const pointRadius = 7
    const moveLine = (totalMovement: Coords2D) => {
        if (point.lines[0] !== null) {
            addToAttribute(point.lines[0], "x2", totalMovement.x)
            addToAttribute(point.lines[0], "y2", totalMovement.y)
        }
        if (point.lines[1] !== null) {
            addToAttribute(point.lines[1], "x1", totalMovement.x)
            addToAttribute(point.lines[1], "y1", totalMovement.y)
        }
    }
    return (
        <MovableSVGElement
            Xattributes={["x"]}
            Yattributes={["y"]}
            coords={[{ x: point.x - pointRadius, y: point.y - pointRadius }]}
            allowMovement={allowMovement}
            onMove={moveLine}
            onFinishMoving={onFinishMoving}
            onMouseDown={onMouseDown}
        >
            <rect
                width={pointRadius * 2}
                height={pointRadius * 2}
                rx="15"
            />
        </MovableSVGElement>
    )
}

export const SelectorLine = (
    {
        coords,
        refCallback,
        onStartMoving,
        onMove,
        onFinishMoving,
        allowMovement,
        onMouseDown,
        propagate: followMouse
    }: SVGLineProps
) => {
    return (
        <MovableSVGElement
            Xattributes={["x1", "x2"]}
            Yattributes={["y1", "y2"]}
            coords={coords}
            allowMovement={allowMovement}
            refCallback={refCallback}
            onMove={onMove}
            onFinishMoving={onFinishMoving}
            onStartMoving={onStartMoving}
            onMouseDown={onMouseDown}
            propagate={followMouse}
        >
            <line className={styles.line} stroke="white" strokeWidth={10} />
        </MovableSVGElement>
    );
}

export function Label({
    text,
    setName,
    coords,
    allowMovement,
    onMove,
    onStartMoving,
    onFinishMoving,
    clickable,
    width = 100,
    height = 30
}: LabelProps) {
    const className = clickable ? styles.labels : `${styles.labels} ${styles.nopointerevents}`
    const [open, setOpen] = useState(false)
    const handleKeyboardEvent: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        e.stopPropagation();
        if (e.key === "Enter") {
            const inputElement = e.target as HTMLInputElement;
            setName(inputElement.value);
            setOpen(false);
        } else if (e.key === "Escape") {
            setOpen(false)
        }
    };


    return (
        <>
            <MovableSVGElement
                Xattributes={["x"]}
                Yattributes={["y"]}
                coords={[coords]}
                allowMovement={allowMovement}
                onStartMoving={onStartMoving}
                onMove={onMove}
                onFinishMoving={onFinishMoving}
            >
                <foreignObject className={className} width={width} height={height} onDoubleClick={(e) => { e.stopPropagation(); setOpen(true) }}>
                    <Chip label={text} />
                </foreignObject>
            </MovableSVGElement>
            <LabelModal open={open} setOpen={setOpen} label={text} onKeyDown={handleKeyboardEvent} />
        </>
    )
}


export function Selection({
    onStartMoving,
    onMove,
    onFinishMoving,
    onMouseDown,
    allowMovement,
    points,
    openLineRefCallback,
    isOpen,
    onClose,
}: SVGSelectionProps) {
    const pointRadius = 7;
    const [currentPoints, setPoints] = useState<Array<Point>>(points)
    const [labelOffset, setLabelOffset] = useState<Coords2D>({ x: 0, y: 0 })
    const [labelName, setLabelName] = useState<string>("slk")

    var bbox = {
        minX: Infinity,
        maxX: -Infinity,
        minY: Infinity,
        maxY: -Infinity
    };

    currentPoints.forEach((p) => {
        bbox.minX = p.x < bbox.minX ? p.x : bbox.minX;
        bbox.maxX = p.x > bbox.maxX ? p.x + pointRadius * 2 : bbox.maxX;
        bbox.minY = p.y < bbox.minY ? p.y : bbox.minY;
        bbox.maxY = p.y > bbox.maxY ? p.y + pointRadius * 2 : bbox.maxY;
    });

    const labelPos = { x: bbox.minX + (bbox.maxX - bbox.minX) / 2 + labelOffset.x, y: bbox.maxY + 5 + labelOffset.y }

    const lineCoords: Array<LineType> = []

    for (var i = 0; i < currentPoints.length; i++) {
        const thisPoint = currentPoints[i]
        const nextPoint = i === currentPoints.length - 1 ? currentPoints[0] : currentPoints[i + 1]
        lineCoords.push({
            position:
                [
                    {
                        x: thisPoint.x,
                        y: thisPoint.y
                    },
                    {
                        x: nextPoint.x,
                        y: nextPoint.y
                    }
                ],
            refCallback: (node: Element) => {
                thisPoint.lines[1] = node
                nextPoint.lines[0] = node
            },
            id: `line-${thisPoint.objId}-${nextPoint.objId}`
        }
        )
    }

    const handleIntermediateMovement: CoordEventHandler = imperativeMoveSiblings
    const handlePolygonStateUpdate: CoordEventHandler = (coords) => {
        const newPoints = currentPoints.map((p) => addToPoint(p, coords))
        setPoints(newPoints)
    }

    const handleStartLabelMovement: CoordEventHandler = (coords, elNode) => {
        if (elNode) elNode.classList.add(styles.moving)
    }

    const handleLabelStateUpdate: CoordEventHandler = (coords, elNode) => {
        setLabelOffset({ x: labelOffset.x + coords.x, y: labelOffset.y + coords.y })
        if (elNode) elNode.classList.remove(styles.moving)
    }

    const handleGroupMouseDown: CoordEventHandler = (coords) => {
        if (onMouseDown)
            onMouseDown(coords)
    }

    const handlePointMouseDown = (coords: Coords2D, i: number) => {
        if (onMouseDown)
            onMouseDown(coords)
        if (onClose && isOpen && i === 0) onClose()
    }

    if (isOpen && openLineRefCallback) {
        lineCoords[lineCoords.length - 1].refCallback = (node: Element) => {
            openLineRefCallback(node)
        }
        lineCoords[lineCoords.length - 1].position[1] = lineCoords[lineCoords.length - 1].position[0]
    }

    return (
        <g>
            <Label text={labelName} setName={setLabelName} coords={labelPos}
                allowMovement={allowMovement}
                onStartMoving={handleStartLabelMovement}
                onFinishMoving={handleLabelStateUpdate}
                clickable={!isOpen}
            />
            {
                lineCoords.map((line, i) => {
                    const coords = line.position
                    return (
                        <SelectorLine
                            coords={coords}
                            key={line.id}
                            allowMovement={allowMovement && !isOpen}
                            propagate={isOpen}
                            refCallback={line.refCallback}
                            onMove={handleIntermediateMovement}
                            onMouseDown={handleGroupMouseDown}
                            onFinishMoving={handlePolygonStateUpdate}
                        />
                    )
                })
            }
            {
                currentPoints.map((point, i) => (
                    <SelectorPoint
                        point={point}
                        allowMovement={allowMovement}
                        key={point.objId}
                        onMouseDown={(coords) => handlePointMouseDown(coords, i)}
                        onFinishMoving={(coords) => {
                            setPoints((oldArr) => {
                                var newArr = [...oldArr]
                                newArr[i] = addToPoint(point, coords)
                                return newArr
                            })
                        }}
                    />
                ))
            }

        </g>
    )
}

export default function Selector({
    width,
    height,
    viewBox,
    initialSelections,
    editMode,
    onKeyDown
}: SVGSelectorProps) {
    const svgRef = useRef<SVGSVGElement | null>(null)
    if (svgRef.current)
        svgRef.current.focus()
    const mode = modeMap[editMode]
    if (typeof initialSelections === "undefined")
        initialSelections = []
    const [selections, setSelections] = useState(initialSelections)
    const [isDrawing, setDrawingState] = useState(false)
    const openLineRef = useRef<Element | null>(null)


    const handleOpenLine = (node: Element) => {
        openLineRef.current = node
    }

    const handleMouseMove: React.MouseEventHandler = (e) => {
        if (!openLineRef.current) return
        const vboxCoords = calcVBOXCoords({ x: e.clientX, y: e.clientY }, svgRef.current)
        openLineRef.current.setAttribute("x2", String(vboxCoords.x))
        openLineRef.current.setAttribute("y2", String(vboxCoords.y))
    }

    useEffect(() => {
        if (!mode.allowedActions.includes("SELECTION_CREATION"))
            setDrawingState(false)
    }, [editMode])

    const handleCanvasMouseDown: MouseEventHandler = (e) => {
        if (!mode.allowedActions.includes("VIEW_MOVEMENT") && isDrawing)
            e.stopPropagation()
        if (e.button === 0 && mode.allowedActions.includes("SELECTION_CREATION")) {
            const point = createPoint(calcVBOXCoords({ x: e.clientX, y: e.clientY }, svgRef.current));
            if (!isDrawing) {
                setDrawingState(true);
                setSelections([...selections, { points: [point], label: "" }]);
            } else {
                const newSelections = [...selections];
                newSelections[newSelections.length - 1].points.push(point);
                setSelections(newSelections);
            }
        }
    }

    const handleGroupMouseDown = (idx: number) => {
        if (!mode.allowedActions.includes("SELECTION_DELETION")) return
        const newSelections = [...selections]
        newSelections.splice(idx, 1)
        setSelections(newSelections)
    }

    var completeSelections: Array<SelectionType> = selections
    var incompleteSelection: SelectionType | null = null
    var IncompleteSelection: React.JSX.Element | null = null

    if (isDrawing) {
        incompleteSelection = selections[selections.length - 1]
        completeSelections = selections.slice(0, -1)
        IncompleteSelection = <Selection allowMovement={false}
            points={incompleteSelection.points}
            isOpen={true}
            onClose={() => setDrawingState(false)}
            openLineRefCallback={handleOpenLine} />
    }

    return (
        <svg
            width={width}
            height={height}
            viewBox={viewBox}
            ref={svgRef}
            onMouseMove={handleMouseMove}
            onMouseDown={handleCanvasMouseDown}
            style={{
                visibility: mode.allowedActions.includes("VIEW") ? "visible" : "hidden"
            }}
        >
            <SelectionContext.Provider value={{ SVGRef: svgRef, editMode: editMode }}>
                {completeSelections.map((selection, i) => (
                    <Selection
                        key={`s-${selections[i].points[0].objId}`}
                        allowMovement={mode.allowedActions.includes("SELECTION_MOVEMENT")}
                        points={selection.points}
                        isOpen={false}
                        onMouseDown={() => handleGroupMouseDown(i)}
                    />
                ))}
                {IncompleteSelection}
            </SelectionContext.Provider>
        </svg>
    )
}