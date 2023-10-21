import { ReactNode, RefObject } from 'react'

declare type MouseEventHandler = (e: React.MouseEvent) => void;

declare type GenericMap<T> = {
    [key: string]: T;
};

declare type Coords2D = {
    x: number,
    y: number,
}

declare type Point = {
    objId: string;
    x: number;
    y: number;
    ox: number;
    oy: number;
    lines: [Element | null, Element | null]
}

declare type LineType = {
    position: [Coords2D, Coords2D]
    refCallback: (any) => void
}

declare type SelectionType = {
    points: Array<Point>;
    label: string;
}

declare type CoordEventHandler = (coords: Coords2D, node?: Element) => void

interface CommonProps {
    svgParent: React.RefObject<SVGSVGElement>;
    allowMovement: boolean;
    onStartMoving?: CoordEventHandler;
    onMove?: CoordEventHandler;
    onFinishMoving?: CoordEventHandler;
    onMouseDown?: React.EventHandler;
}

interface MovableSVGElementProps extends CommonProps {
    children: React.ReactElement<any>;
    Xattributes: string[];
    Yattributes: string[];
    coords: Coords2D[];
    refCallback?: ((node: Element) => void);
    customOffset?: number;
}

declare interface SVGPointProps extends CommonProps {
    point: Point;
}


declare interface SVGLineProps extends CommonProps {
    coords: [Coords2D, Coords2D];
    followMouse: boolean;
    refCallback?: ((node: Element) => void);
}

declare interface SVGSelectionProps extends CommonProps {
    points: Array<Point>;
    isOpen: boolean;
    openLineRefCallback?: ((node: Element) => void);
}

declare interface SVGSelectorProps {
    width: string;
    height: string;
    viewBox: string;
    initialSelections?: Array<SelectionType>;
}