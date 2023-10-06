import { SCompartment, SEdge, SLabel, SModelElement, SNode, SShapeElement } from 'sprotty-protocol';
import { ExpansionState, Graph, PreprocessedEdge, PreprocessedGraph, PreprocessedNode } from "./model";

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
    const header = <SCompartment>{
        id: `header-${preprocessedNode.id}`,
        type: 'node:compartment',
        children: [<SLabel>{
            id: `label-${preprocessedNode.id}`,
            text: preprocessedNode.name,
            type: 'label',
        }],
        layout: 'hbox',
        layoutOptions: {
            paddingLeft: 0,
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
        }
    };

    let expanded = false

    if (preprocessedNode.isExpandable) {
        header.children.unshift(<SShapeElement>{
            id: `expand-${preprocessedNode.id}`,
            type: 'button:expand',
        });

        if(expansionState[preprocessedNode.id] ?? false) {
            expanded = true;
        }
    }

    const body = <SCompartment>{
        id: `body-${preprocessedNode.id}`,
        type: 'node:compartment',
        children: [],
    };

    const subDirectories = preprocessedNode.directories?.map(e => generateNode(e, index, edgesIndex, edges, expansionState));
    body.children.push(...subDirectories ?? []);
    const subFiles = preprocessedNode.files?.map(e => generateNode(e, index, edgesIndex, edges, expansionState));
    body.children.push(...subFiles ?? []);

    const generatedEdges = generateEdges(subDirectories, subFiles, index, edgesIndex, edges);
    body.children.push(...generatedEdges);

    const children = [];
    children.push(header);
    if (body.children.length > 0) {
        children.push(body);
    }

    const node = <SNode>{
        type: `node:${preprocessedNode.type}`,
        id: preprocessedNode.id,
        name: preprocessedNode.name,
        children: children,
        layout: 'vbox',
        expanded: expanded,
    };

    return node;
}

function generateEdges(subDirectories: SModelElement[], subFiles: SModelElement[], index: Map<string, any>, edgesIndex: Map<string, any>, edges: PreprocessedEdge[]): SEdge[] {
    const generatedEdges = [];

    const directories = (subDirectories ?? []).map(e => e.id);
    const files = (subFiles ?? []).map(e => e.id);
    const nodes = directories.concat(files);

    nodes.forEach(node => {
        const edge = edges.find(e => e.sourceId === node)
        if (edge) {
            generatedEdges.push(<SEdge>{
                id: edge.id,
                type: 'edge',
                sourceId: edge.sourceId,
                targetId: edge.targetId,
            })
        }

    })

    return generatedEdges;
}
