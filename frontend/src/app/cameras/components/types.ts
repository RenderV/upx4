export declare type MouseEventHandler = (e: React.MouseEvent) => void;

export declare type GenericMap<T> = {
    [key: string]: T;
};

export declare type Coords2D = {
    x: number,
    y: number,
}

export declare type Point = {
    objId: string;
    x: number;
    y: number;
    ox: number;
    oy: number;
    lines: [Element | null, Element | null]
}

export declare type LineType = {
    position: [Coords2D, Coords2D]
    refCallback: (arg: any) => void
}

export declare type SelectionType = {
    points: Array<Point>;
    label: string;
}

export declare type CoordEventHandler = (coords: Coords2D, node?: Element | null) => void

export enum EditMode{
    ADD = "add",
    EDIT = "edit",
    BLOCK = "block",
    DELETE = "delete"
}

export declare interface CommonProps {
    allowMovement: boolean;
    onStartMoving?: CoordEventHandler;
    onMove?: CoordEventHandler;
    onFinishMoving?: CoordEventHandler;
    onMouseDown?: React.MouseEventHandler;
}

export declare interface MovableSVGElementProps extends CommonProps {
    children: React.ReactElement<any>;
    Xattributes: string[];
    Yattributes: string[];
    coords: Coords2D[];
    refCallback?: ((node: Element) => void);
    customOffset?: number;
}

export declare interface SVGPointProps extends CommonProps {
    point: Point;
}


export declare interface SVGLineProps extends CommonProps {
    coords: [Coords2D, Coords2D];
    followMouse: boolean;
    refCallback?: ((node: Element) => void);
}

export declare interface SVGSelectionProps extends CommonProps {
    points: Array<Point>;
    isOpen: boolean;
    openLineRefCallback?: ((node: Element) => void);
}

export declare interface SVGSelectorProps {
    width: string;
    height: string;
    viewBox: string;
    initialSelections?: Array<SelectionType>;
    editMode: EditMode;
}

export declare type SelectionContextType = {
    SVGRef: React.RefObject<SVGSVGElement | null>|null;
    editMode: EditMode;
}

export declare type customClickBehavior = {
    [key in EditMode]: MouseEventHandler;
}