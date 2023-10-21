import { v4 as uuidv4 } from 'uuid'
import React, { ForwardedRef, RefCallback } from 'react';
import { RefObject, useEffect, useRef, useState } from 'react';
import { Coords2D, Point, SelectionType, SVGPointProps, SVGSelectorProps, SVGSelectionProps, MouseEventHandler, SVGLineProps, MovableSVGElementProps, LineType, CoordEventHandler } from "./types"
import { useDrag, calcVBOXCoords, createRelMovementHandler, addToAttribute, addToPoint, imperativeMoveSiblings } from './newUtils';

export const MovableSVGElement = (
    {
        children,
        refCallback,
        coords,
        onStartMoving,
        onMove,
        onFinishMoving,
        svgParent,
        allowMovement,
        Xattributes,
        Yattributes,
        onMouseDown,

    }: MovableSVGElementProps) => {

    const [position, setPosition] = useState<Array<Coords2D>>(coords)
    const elRef = useRef(null)

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

    const positionProps = {}

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
    svgParent,
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
            svgParent={svgParent}
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

export function SelectorLine(
    {
        coords,
        refCallback,
        onStartMoving,
        onMove,
        onFinishMoving,
        svgParent,
        allowMovement,
        followMouse
    }: SVGLineProps,
) {
    return (
        <MovableSVGElement
            Xattributes={["x1", "x2"]}
            Yattributes={["y1", "y2"]}
            coords={coords}
            svgParent={svgParent}
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


export function Selection({
    onStartMoving,
    onMove,
    onFinishMoving,
    svgParent,
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

    const handleImperativeIntermediateMovement: CoordEventHandler = imperativeMoveSiblings
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
                            svgParent={svgParent}
                            allowMovement={allowMovement && !isOpen}
                            followMouse={false}
                            refCallback={line.refCallback}
                            onMove={handleImperativeIntermediateMovement}
                            onFinishMoving={handlePolygonStateUpdate}
                        />
                    )
                })
            }
            {
                currentPoints.map((point, i) => (
                    <SelectorPoint
                        point={point}
                        svgParent={svgParent}
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
    initialSelections
}: SVGSelectorProps) {
    const svgRef = useRef<SVGSVGElement | null>(null)
    const [selections, setSelections] = useState(initialSelections)
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

    return (
        <svg
            width={width}
            height={height}
            viewBox={viewBox}
            ref={svgRef}
            onMouseMove={handleMouseMove}
        >
            {selections.map((selection, i) => (
                <Selection
                    svgParent={svgRef}
                    allowMovement={true}
                    points={selection.points}
                    isOpen={(i === selections.length - 1)}
                    openLineRefCallback={handleOpenLine}
                />
            ))}
        </svg>
    )
}