import { SEdge, SLabel, SModelElement, SNode, SPort, SShapeElement } from 'sprotty-protocol';
import { ExpansionState, Graph, PreprocessedEdge, PreprocessedGraph, PreprocessedNode } from "./model";
import { getParentOfEdge } from './preprocessor';

export function generate(graph: PreprocessedGraph, expansionState: ExpansionState): Graph {
    const root = generateNode(graph.root, graph.index, graph.edgesIndex, graph.edges, expansionState);

    const diagram = {
        type: 'graph',
        id: 'graph',
        children: [
            root,
        ],
    };

    return diagram;
}

function generateNode(preprocessedNode: PreprocessedNode, index: Map<string, any>, edgesIndex: Map<string, any>, edges: PreprocessedEdge[], expansionState: ExpansionState): SModelElement {
    let expanded = false;
    const children = [];
    if (preprocessedNode.isExpandable) {
        if (expansionState[preprocessedNode.id] ?? false) {
            expanded = true;
        }
    }
    if (preprocessedNode.isExpandable) {
        children.push(<SShapeElement>{
            id: `expand-${preprocessedNode.id}`,
            type: 'button:expand',
            position: { x: 5, y: 10 }
        });
    }

    const label = <SLabel>{
        id: `label-${preprocessedNode.id}`,
        text: preprocessedNode.name,
        type: 'label',
    };
    children.push(label);

    if (expanded || preprocessedNode.name === 'root') {
        const subDirectories = preprocessedNode.directories?.map(e => generateNode(e, index, edgesIndex, edges, expansionState));
        children.push(...subDirectories ?? []);
        const subFiles = preprocessedNode.files?.map(e => generateNode(e, index, edgesIndex, edges, expansionState));
        children.push(...subFiles ?? []);
        const generatedEdges = generateEdges(preprocessedNode, subDirectories, subFiles, index, edgesIndex, edges);
        children.push(...generatedEdges);
    }

    if (preprocessedNode.name !== 'root') {
        children.push(<SPort>{
            id: `port-${preprocessedNode.id}`,
            type: 'port',
            size: { width: 8, height: 8 },
        });
    }

    const node = <SNode>{
        type: `node:${preprocessedNode.type}`,
        id: preprocessedNode.id,
        name: preprocessedNode.name,
        children: children,
        // layout: 'vbox',
        expanded: expanded,
    };

    return node;
}

function generateEdges(node: PreprocessedNode, subDirectories: SModelElement[], subFiles: SModelElement[], index: Map<string, any>, edgesIndex: Map<string, any>, edges: PreprocessedEdge[]): SEdge[] {
    const generatedEdges = [];

    // First need to add edges of the element if it is a directory (directory to file, directory to directory)
    const directEdges = edges.filter(e => e.sourceId === node.id && e.sourceId === getParentOfEdge(e.targetId));
    directEdges.forEach(edge => {
        const alreadyInPlace = generatedEdges.find(e => e.id === edge.id);
        if (!alreadyInPlace) {
            generatedEdges.push(<SEdge>{
                id: edge.id,
                type: 'edge',
                sourceId: `${edge.isCrossBoundary ? 'port-' : ''}${edge.sourceId}`,
                targetId: `${edge.isCrossBoundary ? 'port-' : ''}${edge.targetId}`,
            });
        }
    });

    const directories = (subDirectories ?? []).map(e => e.id);
    const files = (subFiles ?? []).map(e => e.id);
    const children = directories.concat(files);

    children.forEach(child => {
        const childrenEdges = edges.filter(e => e.sourceId === child);

        childrenEdges.forEach(edge => {
            if (edge.sourceId !== getParentOfEdge(edge.targetId)) {
                const alreadyInPlace = generatedEdges.find(e => e.id === edge.id);
                if (!alreadyInPlace) {
                    generatedEdges.push(<SEdge>{
                        id: edge.id,
                        type: 'edge',
                        sourceId: `${edge.isCrossBoundary ? 'port-' : ''}${edge.sourceId}`,
                        targetId: `${edge.isCrossBoundary ? 'port-' : ''}${edge.targetId}`,
                    });
                }
            }
        });
    });

    return generatedEdges;
}
