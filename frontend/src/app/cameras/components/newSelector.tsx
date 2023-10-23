import React, { MouseEventHandler, createContext, useContext, useReducer } from 'react';
import { RefObject, useEffect, useRef, useState } from 'react';
import { Coords2D, Point, SelectionType, SVGPointProps, SVGSelectorProps, SVGSelectionProps, SVGLineProps, MovableSVGElementProps, LineType, CoordEventHandler, GenericMap, SelectionContextType, EditMode, customClickBehavior } from "./types"
import { calcVBOXCoords, createRelMovementHandler, addToAttribute, addToPoint, imperativeMoveSiblings, createPoint } from './newUtils';

export const SelectionContext = createContext<SelectionContextType | null>(null)

enum SelectionActions {
    ADD_POINT = 'ADD_POINT',
    CREATE_POLYGON = 'CREATE_POLYGON',
    DELETE_POLYGON = 'DELETE_POLYGON',
    MODIFY_POINT = 'MODIFY_POINT',
    DELETE_POINT = 'DELETE_POINT',
    MOVE_POLYGON = 'MOVE_POLYGON',
    REBUILD = 'REBUILD',
    SET_DRAWING = 'SET_DRAWING'
}

interface AddPointAction {
    type: SelectionActions.ADD_POINT;
    point: Point;
}

interface CreatePolygonAction {
    type: SelectionActions.CREATE_POLYGON;
    label: string;
    polygon: Point[];
}

interface DeletePolygonAction {
    type: SelectionActions.DELETE_POLYGON;
    polygonIdx: number;
}

interface ModifyPointAction {
    type: SelectionActions.MODIFY_POINT;
    id: string;
    x: number;
    y: number;
}

interface DeletePointAction {
    type: SelectionActions.DELETE_POINT;
    id: string;
}

interface MovePolygonAction {
    type: SelectionActions.MOVE_POLYGON;
    polygonIdx: number;
    xoffset: number;
    yoffset: number;
}

interface RebuildAction {
    type: SelectionActions.REBUILD;
    newSelections: SelectionType[];
}

interface DrawingAction {
    type: SelectionActions.SET_DRAWING;
    isDrawing: boolean;
}

type SelectionAction =
    | AddPointAction
    | CreatePolygonAction
    | DeletePolygonAction
    | ModifyPointAction
    | DeletePointAction
    | MovePolygonAction
    | RebuildAction
    | DrawingAction;

interface SelectionState {
    selections: SelectionType[];
    isDrawing: boolean;
}

function selectorReducer(state: SelectionState, action: SelectionAction) {
    switch (action.type) {
        case SelectionActions.ADD_POINT: {
            const { selections } = state;
            const updatedSelections = selections.slice();
            updatedSelections[selections.length - 1].points.push(action.point);
            return { ...state, selections: updatedSelections };
        }
        case SelectionActions.CREATE_POLYGON: {
            const { selections } = state;
            const updatedSelections = selections.slice();
            updatedSelections.push({ points: action.polygon, label: action.label });
            return { ...state, selections: updatedSelections };
        }
        case SelectionActions.DELETE_POINT: {
            const { selections } = state;
            const updatedSelections = selections.map(selection => {
                return { ...selection, points: selection.points.filter(point => point.objId !== action.id) };
            });
            return { ...state, selections: updatedSelections };
        }
        case SelectionActions.DELETE_POLYGON: {
            const { selections } = state;
            const updatedSelections = selections.slice();
            updatedSelections.splice(action.polygonIdx, 1);
            return { ...state, selections: updatedSelections };
        }
        case SelectionActions.MODIFY_POINT: {
            const { selections } = state;
            const updatedSelections = selections.map(selection => {
                return {
                    ...selection,
                    points: selection.points.map(point => {
                        if (point.objId === action.id) {
                            return {
                                ...point,
                                x: action.x,
                                y: action.y,
                            };
                        }
                        return point;
                    }),
                };
            });
            return { ...state, selections: updatedSelections };
        }
        case SelectionActions.MOVE_POLYGON: {
            const { selections } = state;
            const updatedSelections = selections.slice();
            const polygonToMove = updatedSelections[action.polygonIdx];

            if (polygonToMove) {
                polygonToMove.points = polygonToMove.points.map(point => ({
                    ...point,
                    x: point.x + action.xoffset,
                    y: point.y + action.yoffset,
                }));
            }

            return { ...state, selections: updatedSelections };
        }

        case SelectionActions.REBUILD: {
            return { ...state, selections: action.newSelections };
        }

        case SelectionActions.SET_DRAWING: {
            return { ...state, isDrawing: action.isDrawing }
        }

        default:
            return state;
    }
}

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
            if (typeof onMove !== 'undefined')
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
            onFinishMoving(totalMovement)
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
                e.stopPropagation()
                handleMouseDown(e);
                if (onMouseDown) onMouseDown(e)
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
        >
            <rect
                width={pointRadius * 2}
                height={pointRadius * 2}
                rx="15"
            />
        </MovableSVGElement>
    )
}

export const SelectorLine = React.forwardRef((
    {
        coords,
        refCallback,
        onStartMoving,
        onMove,
        onFinishMoving,
        allowMovement,
        followMouse
    }: SVGLineProps, ref
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
        >
            <line stroke="white" strokeWidth={10} />
        </MovableSVGElement>
    );
}
)


export function Selection({
    onStartMoving,
    onMove,
    onFinishMoving,
    allowMovement,
    points,
    openLineRefCallback,
    isOpen
}: SVGSelectionProps) {
    const pointRadius = 7;
    const [currentPoints, setPoints] = useState<Array<Point>>(points)
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
            }
        }
        )
    }

    const handleIntermediateMovement: CoordEventHandler = imperativeMoveSiblings
    const handlePolygonStateUpdate: CoordEventHandler = (coords) => {
        setPoints((oldPoints) => {
            const newPoints = oldPoints.map((oldPoint) => {
                return addToPoint(oldPoint, coords)
            })
            return newPoints
        })
    }

    if (isOpen && openLineRefCallback) {
        lineCoords[lineCoords.length - 1].refCallback = (node: Element) => {
            openLineRefCallback(node)
        }
    }

    return (
        <g>
            {
                lineCoords.map((line, i) => {
                    const coords = line.position
                    return (
                        <SelectorLine
                            coords={coords}
                            allowMovement={allowMovement && !isOpen}
                            followMouse={false}
                            refCallback={line.refCallback}
                            onMove={handleIntermediateMovement}
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

export function Selector({
    width,
    height,
    viewBox,
    initialSelections,
    editMode
}: SVGSelectorProps) {
    const svgRef = useRef<SVGSVGElement | null>(null)

    if (typeof initialSelections === "undefined")
        initialSelections = []

    const [selections, dispatchSelections] = useReducer(selectorReducer, { selections: initialSelections, isDrawing: false })
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

    const clickMap: customClickBehavior = {
        [EditMode.ADD]: (e) => {
            e.stopPropagation()
            if (e.button === 0) {
                if (!selections.isDrawing) {
                    dispatchSelections({ type: SelectionActions.SET_DRAWING, isDrawing: true })
                    dispatchSelections({ type: SelectionActions.CREATE_POLYGON, polygon: [], label: "" })
                }
                dispatchSelections({
                    type: SelectionActions.ADD_POINT,
                    point: createPoint(calcVBOXCoords({
                        x: e.clientX,
                        y: e.clientY
                    }, svgRef.current))
                })
            }
        },
        [EditMode.BLOCK]: (e) => { },
        [EditMode.DELETE]: (e) => { },
        [EditMode.EDIT]: (e) => { }
    }

    const handleCanvasClick: MouseEventHandler = (e) => {
        clickMap[editMode](e)
    }

    return (
        <svg
            width={width}
            height={height}
            viewBox={viewBox}
            ref={svgRef}
            onMouseMove={handleMouseMove}
            onMouseDown={handleCanvasClick}
        >
            <SelectionContext.Provider value={{ SVGRef: svgRef, editMode: editMode }}>
                {selections.selections.map((selection, i) => (
                    <Selection
                        allowMovement={true}
                        points={selection.points}
                        isOpen={i === selections.selections.length-1 && selections.isDrawing}
                        openLineRefCallback={handleOpenLine}
                    />
                ))}
            </SelectionContext.Provider>
        </svg>
    )
}