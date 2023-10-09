import 'reflect-metadata';

import { LocalModelSource, TYPES } from 'sprotty';
import { FitToScreenAction, SelectAction } from 'sprotty-protocol';
import { CollapseAllAction, ExpandAllAction } from './actions';
import createContainer from './di.config';
import { generate } from './generator';
import { Directory } from './model';
import { preprocess } from './preprocessor';

document.addEventListener("DOMContentLoaded", async () => {
    const container = createContainer('sprotty-diagram');
    const modelSource = container.get<LocalModelSource>(TYPES.ModelSource);

    const rawData = require('./data.json') as Directory;

    const preprocessed = preprocess(rawData, {});

    const graph = generate(preprocessed, {});

    modelSource.setModel(graph);

    document.getElementById('collapse-all-button').addEventListener('click', () => {
        const collapseAllAction: CollapseAllAction = {
            kind: 'collapseAll'
        };
        modelSource.actionDispatcher.dispatch(collapseAllAction);
    });

    document.getElementById('expand-all-button').addEventListener('click', () => {
        const expandAllAction: ExpandAllAction = {
            kind: 'expandAll'
        };
        modelSource.actionDispatcher.dispatch(expandAllAction);
    });

    document.getElementById('fit-to-screen-button').addEventListener('click', async () => {
        const selectedElements = (await modelSource.getSelection()).map(e => e.id) as string[];
        const selectAction: SelectAction = {
            kind: 'elementSelected',
            selectedElementsIDs: [],
            deselectedElementsIDs: selectedElements
        };
        const fitToScreenAction: FitToScreenAction = {
            kind: 'fit',
            elementIds: [],
            animate: true
        };
        modelSource.actionDispatcher.dispatchAll([selectAction, fitToScreenAction]);
    });
});
