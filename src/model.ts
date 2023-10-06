import { Expandable, SNodeImpl, expandFeature } from "sprotty";

export interface ExpansionState {
    [id: string]: boolean;
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