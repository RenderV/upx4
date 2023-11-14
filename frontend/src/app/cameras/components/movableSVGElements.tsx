import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Coords2D, SVGPointProps, SVGLineProps, MovableSVGElementProps, GenericMap, EditMode, LabelProps } from "../types";
import { calcVBOXCoords, createRelMovementHandler, addToAttribute, useSelectionContext } from './utils';
import { Chip } from '@mui/material';
import LabelModal from './labelmodal';
import styles from "./selector.module.css";

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
    const svgParent = useSelectionContext()?.SVGRef
    if (!svgParent)
        throw new Error("svg parent must have a valid ref")

    useEffect(() => {
        setPosition(coords)
    }, [coords])

    if (coords.length !== Xattributes.length || coords.length !== Yattributes.length)
        throw new Error("Arguments Xattributes, Yattributes and coords don't have the same length")


    const cvtPos = (coords: Coords2D) => calcVBOXCoords(coords, svgParent.current)

    const handleStartPosition = (totalMovement: Coords2D) => {
        if(onStartMoving){
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
            onMouseDown={() => {console.log("x: ", point.x, "y: ", point.x)}}
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
    changeName: setName,
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
    const ctx = useSelectionContext()
    const changeMode = ctx?.changeMode
    const editMode = ctx?.editMode
    const previousState = useRef(editMode)
    const openModal = (state: boolean) => {
        setOpen(state)
        if (!changeMode) return
        if (state) {
            previousState.current = editMode
            changeMode(EditMode.DEFAULT)
        }
        else {
            changeMode(previousState.current)
        }
    }
    const handleKeyboardEvent: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        e.stopPropagation();
        if (e.key === "Enter") {
            const inputElement = e.target as HTMLInputElement;
            setName(inputElement.value);
            openModal(false);
        } else if (e.key === "Escape") {
            openModal(false)
        }
    };
    coords.x -= 30

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
                <foreignObject className={className} width={width} height={height} onDoubleClick={(e) => { openModal(true) }}>
                    <Chip label={text} />
                </foreignObject>
            </MovableSVGElement>
            <LabelModal open={open} setOpen={openModal} label={text} onKeyDown={handleKeyboardEvent} />
        </>
    )
}

