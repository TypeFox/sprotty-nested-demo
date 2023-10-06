import { SCompartment, SEdge, SLabel, SModelElement, SNode, SShapeElement } from 'sprotty-protocol';
import { Directory, ExpansionState, File } from "./model";

export function generate(data: Directory, expansionState: ExpansionState): any {
    const index = new Map<string, SModelElement>();
    const edgesIndex = new Map<string, SEdge>();
    const graph = {
        type: 'graph',
        id: 'graph',
        children: [
            generateRoot(data, expansionState),
        ],
        index: index,
        edgesIndex: edgesIndex,
    };

    return graph;
}

function generateRoot(root: Directory ,expansionState: ExpansionState): any {
    const header = <SCompartment>{
        id: `header-${root.path}`,
        type: 'node:compartment',
        children: [],
        layout: 'hbox',
        layoutOptions: {
            paddingLeft: 0,
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
        }
    };
    const label = <SLabel>{
        id: `label-${root.path}`,
        text: root.name,
        type: 'label',
    };
    header.children.push(label);

    const body = <SCompartment>{
        id: `body-${root.path}`,
        type: 'node:compartment',
        children: [],
    };

    body.children.push(...root.directories.map(e => generateDirectory(e, expansionState)), ...root.files.map(e => generateFile(e, [])));

    const children = [];
    children.push(header);
    if (body.children.length > 0) {
        children.push(body);
    }
    console.log(children)

    return <SNode>{
        type: 'node:directory',
        id: root.path,
        name: root.name,
        children: children,
        layout: 'vbox',
        expanded: expansionState[root.path] ?? false
    };
}

function generateDirectory(directory: Directory, expansionState: ExpansionState) {
    const header = <SCompartment>{
        id: `header-${directory.path}`,
        type: 'node:compartment',
        children: [],
        layout: 'hbox',
        layoutOptions: {
            paddingLeft: 0,
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
        }
    };
    if (directory.isExpandable) {
        header.children.push(<SShapeElement>{
            id: `expand-${directory.path}`,
            type: 'button:expand',
        });
    }
    const label = <SLabel>{
        id: `label-${directory.path}`,
        text: directory.name,
        type: 'label',
    };
    header.children.push(label);

    const edges: any[] = [];

    const body = <SCompartment>{
        id: `body-${directory.path}`,
        type: 'node:compartment',
        children: [],
    };
    if (expansionState[directory.path]) {
        body.children.push(...directory.directories.map(e => generateDirectory(e, expansionState)), ...directory.files.map(e => generateFile(e, edges)));
    }
    if (edges.length > 0) {
        body.children.push(...edges);
    }

    const children = [];
    if (header.children.length === 1) {
        children.push(label);
    } else {
        children.push(header);
    }
    if (body.children.length > 0) {
        children.push(body);
    }

    return <SNode>{
        type: 'node:directory',
        id: directory.path,
        name: directory.name,
        children: children,
        layout: 'vbox',
        expanded: expansionState[directory.path] ?? false
    };
}

function generateFile(file: File, edges: any[]) {
    const label = <SLabel>{
        id: `label-${file.path}`,
        text: file.name,
        type: 'label',

    };
    file.imports.forEach(e => {
        edges.push(generateEdge(file.path, e));
    });

    return {
        type: 'node:file',
        id: file.path,
        name: file.name,
        children: [label],
        layout: 'vbox',
        layoutOptions: {
            paddingLeft: 10,
            paddingTop: 10,
            paddingRight: 10,
            paddingBottom: 10,
            hAlign: 'center',
            vAlign: 'top',
        }
    };
}

function generateEdge(sourceId: string, targetId: string) {
    return <SEdge>{
        id: `${sourceId}->${targetId}`,
        sourceId: sourceId,
        targetId: targetId,
        type: 'edge',
    };
}