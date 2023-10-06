import 'reflect-metadata'

import { LocalModelSource, TYPES } from 'sprotty'
import createContainer from './di.config'
import { Directory } from './model';
import { generate } from './generator';

document.addEventListener("DOMContentLoaded", () => {
    const container = createContainer('sprotty-diagram');
    const modelSource = container.get<LocalModelSource>(TYPES.ModelSource);

    const rawData = require('./data.json') as Directory;

    const graph = generate(rawData, {});

    modelSource.setModel(graph);
});