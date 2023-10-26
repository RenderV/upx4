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
    id: string
}

export declare type SelectionType = {
    points: Array<Point>;
    label: string;
}

export declare type CoordEventHandler = (coords: Coords2D, node?: Element | null, e?: React.MouseEvent) => void

export enum EditMode {
    ADD = "add",
    EDIT = "edit",
    DELETE = "delete",
    HIDE = "hide",
    DEFAULT = "default",
}

export declare interface CommonProps {
    allowMovement: boolean;
    onStartMoving?: CoordEventHandler;
    onMove?: CoordEventHandler | null;
    onFinishMoving?: CoordEventHandler | null;
    onMouseDown?: CoordEventHandler | null;
}

export declare interface MovableSVGElementProps extends CommonProps {
    children: React.ReactElement<any>;
    Xattributes: string[];
    Yattributes: string[];
    coords: Coords2D[];
    refCallback?: ((node: Element) => void);
    customOffset?: number;
    propagate?: boolean;
}

export declare interface SVGPointProps extends CommonProps {
    point: Point;
}


export declare interface SVGLineProps extends CommonProps {
    coords: [Coords2D, Coords2D];
    propagate: boolean;
    refCallback?: ((node: Element) => void);
}

export declare interface SVGSelectionProps extends CommonProps {
    points: Array<Point>;
    isOpen: boolean;
    openLineRefCallback?: ((node: Element) => void);
    onClose?: () => void
}

export declare interface LabelProps extends CommonProps {
    text: string
    setName: React.Dispatch<React.SetStateAction<string>>
    coords: Coords2D
    clickable: boolean
    width?: number
    height?: number
}

export declare interface SVGSelectorProps {
    width: string;
    height: string;
    viewBox: string;
    initialSelections?: Array<SelectionType>;
    editMode: EditMode;
    changeMode: (mode: EditMode) => void
    onKeyDown?: React.KeyboardEventHandler
}

export declare type SelectionContextType = {
    SVGRef: React.RefObject<SVGSVGElement | null> | null;
    editMode: EditMode;
    changeMode: (mode: EditMode) => void
}

export declare type AllowedAction = "SELECTION_MOVEMENT" |
                                    "SELECTION_CREATION" |
                                    "SELECTION_DELETION" |
                                    "VIEW"               |
                                    "VIEW_MOVEMENT"      |
                                    "BLOCK_SHORTCUTS"

export declare type ModeMapType = {
    [key in EditMode]: {
        allowedActions: Array<AllowedAction>
        shortcuts: Array<string>
    };
}

export declare interface MenuItemProps {
    Icon: React.ElementType;
    title: string;
    onClick: () => void;
    className: string;
}

export declare interface CanvasControllerProps {
    editMode: EditMode;
    changeMode: (mode: EditMode) => void;
}

export declare type EditModeButton = {
    icon: React.ElementType
    label: string
    mode: EditMode
    labelInactive?: string
}
