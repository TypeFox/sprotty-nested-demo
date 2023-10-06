import { Expandable, SNodeImpl, expandFeature } from "sprotty";
import { SEdge, SModelElement } from 'sprotty-protocol';

export interface ExpansionState {
    [id: string]: boolean;
}

export interface PreprocessedGraph {
    type: string;
    id: string;
    root: PreprocessedNode;
    index: Map<string, SModelElement>;
    edgesIndex: Map<string, SEdge>;
    edges: PreprocessedEdge[];
}

export interface PreprocessedNode {
    type: string;
    id: string;
    name: string;
    directories?: PreprocessedNode[];
    files?: PreprocessedNode[];
    parent?: string;
    isExpandable?: boolean;
}

export interface PreprocessedEdge {
    type: string;
    id: string;
    sourceId: string;
    targetId: string;
}

export interface Graph {
    type: string;
    id: string;
    children: SModelElement[];
}

export interface Directory {
    name: string;
    path: string;
    directories: Directory[];
    files: File[];
    isExpandable: boolean;
}

export interface File {
    name: string;
    path: string;
    imports: string[];
}

export class DirectoryImpl extends SNodeImpl implements Expandable {
    static readonly DEFAULT_FEATURES = super.DEFAULT_FEATURES.concat(expandFeature)
    isExpandable: boolean;
    expanded: boolean;
}