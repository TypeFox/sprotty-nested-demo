import { Directory, ExpansionState, File, PreprocessedEdge, PreprocessedGraph, PreprocessedNode } from "./model";

export function preprocess(data: Directory, expansionState: ExpansionState): PreprocessedGraph {
    const index = new Map<string, any>();
    const edgesIndex = new Map<string, any>();

    const root = preprocessRoot(data, expansionState, index, edgesIndex);

    const edges = preprocessEdges(index, edgesIndex);
    console.log(edges);

    const preprocessedGraph = {
        type: 'graph',
        id: 'graph',
        root: preprocessRoot(data, expansionState, index, edgesIndex),
        index: index,
        edgesIndex: edgesIndex,
        edges: edges,
    };

    return preprocessedGraph;
}

function preprocessRoot(data: Directory, expansionState: ExpansionState, index: Map<string, any>, edgesIndex: Map<string, any>): PreprocessedNode {
    const subDirectories = data.directories.map(directory => preprocessDirectory(directory, expansionState, index, edgesIndex, 'root')).filter(e => e !== undefined);
    const subFiles = data.files.map(file => preprocessFile(file, expansionState, index, edgesIndex, 'root')).filter(e => e !== undefined);

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

function preprocessDirectory(data: Directory, expansionState: ExpansionState, index: Map<string, any>, edgesIndex: Map<string, any>, parent?: string): PreprocessedNode {
    const subDirectories = data.directories.map(directory => preprocessDirectory(directory, expansionState, index, edgesIndex, data.path));
    const subDirectoriesFiltered = subDirectories.filter(e => e !== undefined);
    const subFiles = data.files.map(file => preprocessFile(file, expansionState, index, edgesIndex, data.path));
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

    if (expansionState[parent] || parent === 'root') {
        index.set(node.id, node);
        return node;
    }
}

function preprocessFile(data: File, expansionState: ExpansionState, index: Map<string, any>, edgesIndex: Map<string, any>, parent?: string): PreprocessedNode {
    data.imports.forEach(imported => {
        const edge = {
            type: 'import',
            id: `${data.path}-${imported}`,
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

    if (expansionState[parent] || parent === 'root') {
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
            edges.push(edge);
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
            edges.push(edge);
        }
    }

    return edges;
}

function getParentOfEdge(sourceId: any): string | undefined {
    return sourceId.substring(0, sourceId.lastIndexOf('/'));
}
