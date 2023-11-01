'use client'
import React, { MouseEventHandler } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Coords2D, Point, SelectionType, SVGSelectorProps, SVGSelectionProps, LineType, CoordEventHandler, EditMode, ModeMapType } from "../types";
import { calcVBOXCoords, addToPoint, imperativeMoveSiblings, createPoint, SelectionContextProvider, useSelectionContext } from './utils';
import { SelectorLine, SelectorPoint, Label } from "./movableSVGElements";
import { v4 as uuidv4 } from 'uuid'
import styles from "./selector.module.css";

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


export function Selection({
    allowMovement,
    onSelectionUpdate,
    onClose,
    onMouseDown,
    points,
    openLineRefCallback,
    isOpen,
}: SVGSelectionProps) {
    const pointRadius = 7;
    const [currentPoints, setPoints] = useState(points)
    const [labelOffset, setLabelOffset] = useState<Coords2D>({ x: 0, y: 0 })

    useEffect(() => {
        if(onSelectionUpdate) onSelectionUpdate(currentPoints)
    }, [currentPoints])

    var bbox = {
        minX: Infinity,
        maxX: -Infinity,
        minY: Infinity,
        maxY: -Infinity
    };

    currentPoints.points.forEach((p) => {
        bbox.minX = p.x < bbox.minX ? p.x : bbox.minX;
        bbox.maxX = p.x > bbox.maxX ? p.x + pointRadius * 2 : bbox.maxX;
        bbox.minY = p.y < bbox.minY ? p.y : bbox.minY;
        bbox.maxY = p.y > bbox.maxY ? p.y + pointRadius * 2 : bbox.maxY;
    });

    const labelPos = {
        x: bbox.minX + (bbox.maxX - bbox.minX) / 2 + labelOffset.x,
        y: bbox.maxY + 5 + labelOffset.y
    }

    const lineCoords: Array<LineType> = []

    for (var i = 0; i < currentPoints.points.length; i++) {
        const thisPoint = currentPoints.points[i]
        const nextPoint = i === currentPoints.points.length - 1 ? currentPoints.points[0] : currentPoints.points[i + 1]
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

    const handlePolygonStartMovement: CoordEventHandler = (coords, elNode) => {
        if (!allowMovement) return
        elNode?.parentElement?.classList.add(styles.moving)
    }

    const handlePolygonIntermediateMovement: CoordEventHandler = imperativeMoveSiblings
    const handlePolygonStateUpdate: CoordEventHandler = (coords, elNode) => {
        const newPoints = currentPoints.points.map((p) => addToPoint(p, coords))
        setPoints({ ...currentPoints, points: newPoints })
        elNode?.parentElement?.classList.remove(styles.moving)
    }

    const handleStartLabelMovement: CoordEventHandler = (coords, elNode) => {
        if (!allowMovement) return
        elNode?.parentElement?.classList.add(styles.moving)
    }

    const handleLabelStateUpdate: CoordEventHandler = (coords, elNode) => {
        setLabelOffset({ x: labelOffset.x + coords.x, y: labelOffset.y + coords.y })
        elNode?.parentElement?.classList.remove(styles.moving)
    }

    const handlePolygonMouseDown: CoordEventHandler = (coords) => {
        if (onMouseDown)
            onMouseDown(coords)
    }

    const handlePointMouseDown = (coords: Coords2D, i: number) => {
        if (onMouseDown)
            onMouseDown(coords)
        if (onClose && isOpen && i === 0)
            onClose()
    }

    const changeLabelName = (newName: string) => {
        setPoints({ ...currentPoints, label: newName })
    }

    if (isOpen && openLineRefCallback) {
        lineCoords[lineCoords.length - 1].refCallback = (node: Element) => {
            openLineRefCallback(node)
        }
        lineCoords[lineCoords.length - 1].position[1] = lineCoords[lineCoords.length - 1].position[0]
    }

    return (
        <g>
            <Label text={currentPoints.label} changeName={changeLabelName} coords={labelPos}
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
                            onMouseDown={handlePolygonMouseDown}
                            onStartMoving={handlePolygonStartMovement}
                            onMove={handlePolygonIntermediateMovement}
                            onFinishMoving={handlePolygonStateUpdate}
                        />
                    )
                })
            }
            {
                currentPoints.points.map((point, i) => (
                    <SelectorPoint
                        point={point}
                        allowMovement={allowMovement}
                        key={point.objId}
                        onMouseDown={(coords) => handlePointMouseDown(coords, i)}
                        onFinishMoving={(coords) => {
                            setPoints((oldSelection) => {
                                var newArr = [...oldSelection.points]
                                newArr[i] = addToPoint(point, coords)
                                return { ...oldSelection, points: newArr }
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
    changeMode,
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
                const labelId = uuidv4()
                setSelections([...selections, { points: [point], label: `vaga-${labelId}`, objId: labelId }]);
            } else {
                const newSelections = [...selections];
                newSelections[newSelections.length - 1].points.push(point);
                setSelections(newSelections);
            }
        }
    }

    const deleteSelection = (idx: number) => {
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
            points={incompleteSelection}
            isOpen={true}
            onClose={() => setDrawingState(false)}
            openLineRefCallback={handleOpenLine} />
    }
    const display = mode.allowedActions.includes("VIEW") ? "" : "none"

    return (
        <svg
            width={width}
            height={height}
            viewBox={viewBox}
            ref={svgRef}
            onMouseMove={handleMouseMove}
            onMouseDown={handleCanvasMouseDown}
            style={{
                display: display
            }}
        >
            <SelectionContextProvider value={{ SVGRef: svgRef, editMode: editMode, changeMode: changeMode }}>
                {completeSelections.map((selection, i) => (
                    <Selection
                        key={selection.objId}
                        allowMovement={mode.allowedActions.includes("SELECTION_MOVEMENT")}
                        points={selection}
                        isOpen={false}
                        onMouseDown={() => deleteSelection(i)}
                    />
                ))}
                {IncompleteSelection}
            </SelectionContextProvider>
        </svg>
    )
}