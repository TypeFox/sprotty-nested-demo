export namespace CollapseAllAction {
    export const KIND = 'collapseAll';
}

export interface CollapseAllAction {
    kind: typeof CollapseAllAction.KIND;
}

export namespace ExpandAllAction {
    export const KIND = 'expandAll';
}

export interface ExpandAllAction {
    kind: typeof ExpandAllAction.KIND;
}
