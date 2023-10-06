import 'reflect-metadata';

import { LocalModelSource, TYPES } from 'sprotty';
import createContainer from './di.config';
import { generate } from './generator';
import { Directory } from './model';
import { preprocess } from './preprocessor';

document.addEventListener("DOMContentLoaded", () => {
    const container = createContainer('sprotty-diagram');
    const modelSource = container.get<LocalModelSource>(TYPES.ModelSource);

    const rawData = require('./data.json') as Directory;

    const preprocessed = preprocess(rawData, {});

    const graph = generate(preprocessed, {});

    modelSource.setModel(graph);
});