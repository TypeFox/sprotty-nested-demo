import { Directory, ExpansionState, File, PreprocessedEdge, PreprocessedGraph, PreprocessedNode } from "./model";

export function preprocess(data: Directory, expansionState: ExpansionState, expandAll?: boolean): PreprocessedGraph {
    const index = new Map<string, any>();
    const edgesIndex = new Map<string, any>();

    const root = preprocessRoot(data, expansionState, index, edgesIndex, expandAll);

    const edges = preprocessEdges(index, edgesIndex);

    const preprocessedGraph = {
        type: 'graph',
        id: 'graph',
        root: root,
        index: index,
        edgesIndex: edgesIndex,
        edges: edges,
    };

    return preprocessedGraph;
}

function preprocessRoot(data: Directory, expansionState: ExpansionState, index: Map<string, any>, edgesIndex: Map<string, any>, expandAll?: boolean): PreprocessedNode {
    const subDirectories = data.directories.map(directory => preprocessDirectory(directory, expansionState, index, edgesIndex, 'root', expandAll)).filter(e => e !== undefined);
    const subFiles = data.files.map(file => preprocessFile(file, expansionState, index, edgesIndex, 'root', expandAll)).filter(e => e !== undefined);

    const root = {
        type: 'directory',
        id: data.path,
        name: 'root',
        directories: subDirectories,
        files: subFiles,
        parent: undefined,
    };

    index.set(root.id, root);

    return root;
}

function preprocessDirectory(data: Directory, expansionState: ExpansionState, index: Map<string, any>, edgesIndex: Map<string, any>, parent?: string, expandAll?: boolean): PreprocessedNode {
    const subDirectories = data.directories.map(directory => preprocessDirectory(directory, expansionState, index, edgesIndex, data.path, expandAll));
    const subDirectoriesFiltered = subDirectories.filter(e => e !== undefined);
    const subFiles = data.files.map(file => preprocessFile(file, expansionState, index, edgesIndex, data.path, expandAll));
    const subFilesFiltered = subFiles.filter(e => e !== undefined);

    const node = {
        type: 'directory',
        id: data.path,
        name: data.name,
        directories: subDirectoriesFiltered,
        files: subFilesFiltered,
        parent: parent,
        isExpandable: subDirectories.length > 0 || subFiles.length > 0
    };

    if (expandAll && (subDirectories.length > 0 || subFiles.length > 0)) {
        expansionState[node.id] = true;
    }

    if (expansionState[parent] || parent === 'root' || expandAll) {
        index.set(node.id, node);
        return node;
    }
}

function preprocessFile(data: File, expansionState: ExpansionState, index: Map<string, any>, edgesIndex: Map<string, any>, parent?: string, expandAll?: boolean): PreprocessedNode {
    data.imports.forEach(imported => {
        const edge = {
            type: 'import',
            id: `${data.path}->${imported}`,
            sourceId: data.path,
            targetId: imported,
        };

        edgesIndex.set(edge.id, edge);
    });

    const node = {
        type: 'file',
        id: data.path,
        name: data.name,
        parent: parent
    };

    if (expansionState[parent] || parent === 'root' || expandAll) {
        index.set(node.id, node);
        return node;
    }
}

function preprocessEdges(index: Map<string, any>, edgesIndex: Map<string, any>) {
    const edges: PreprocessedEdge[] = [];

    for (const edge of edgesIndex.values()) {
        let source = index.get(edge.sourceId);
        let target = index.get(edge.targetId);

        if (source && target) {
            const splitEdges = [];
            splitEdge(edge, source.id, target.id, splitEdges);
            edges.push(...splitEdges);
            continue;
        }

        while (!source) {
            const parentId = getParentOfEdge(edge.sourceId);
            if (parentId === '/') {
                break;
            }
            edge.sourceId = parentId;
            source = index.get(parentId);
        }

        while (!target) {
            const parentId = getParentOfEdge(edge.targetId);
            if (parentId === '/') {
                break;
            }
            edge.targetId = parentId;
            target = index.get(parentId);
        }

        if (source.id !== target.id) {
            const splitEdges = [];
            splitEdge(edge, source.id, target.id, splitEdges);
            edges.push(...splitEdges);
        }
    }

    return edges;
}

function splitEdge(edge: any, source: string, target: string, splitEdges: any[]): void {
    let sourceParent = getParentOfEdge(source);
    let targetParent = getParentOfEdge(target);
    
    if (sourceParent === targetParent) {
        splitEdges.push(edge);
        return;
    }
    
    const commonPath = getCommonPath(source, target);
    
    while (sourceParent !== commonPath) {
        splitEdges.push(<PreprocessedEdge>{
            type: 'import',
            id: `${source}->${sourceParent}`,
            sourceId: source,
            targetId: sourceParent,
            isCrossBoundary: true,
        });
        
        source = sourceParent;
        if(source === '') {
            break;
        }
        sourceParent = getParentOfEdge(source);
    }
    
    while (targetParent !== commonPath) {
        splitEdges.push(<PreprocessedEdge>{
            type: 'import',
            id: `${targetParent}->${target}`,
            sourceId: targetParent,
            targetId: target,
            isCrossBoundary: true,
        });
        
        target = targetParent;
        if (target === '') {
            break;
        }
        targetParent = getParentOfEdge(target);
    }
    
    splitEdges.push(<PreprocessedEdge>{
        type: 'import',
        id: `${source}->${target}`,
        sourceId: source,
        targetId: target,
        isCrossBoundary: true,
    });
}

export function getParentOfEdge(sourceId: any): string | undefined {
    return sourceId.substring(0, sourceId.lastIndexOf('/'));
}

function getCommonPath(source, target): string {
    const commonPath = [];

    const sourcePathSplit = source.split('/');
    const targetPathSplit = target.split('/');

    for (let i = 0; i < sourcePathSplit.length; i++) {
        if (sourcePathSplit[i] === targetPathSplit[i]) {
            commonPath.push(sourcePathSplit[i]);
        } else {
            break;
        }
    }

    return commonPath.join('/');
}
