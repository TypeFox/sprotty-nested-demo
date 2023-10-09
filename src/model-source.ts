import { injectable } from 'inversify';
import { ActionHandlerRegistry, LocalModelSource } from 'sprotty';
import { Action, CollapseExpandAction } from 'sprotty-protocol';
import { CollapseAllAction, ExpandAllAction } from './actions';
import { generate } from './generator';
import { ExpansionState } from './model';
import { preprocess } from './preprocessor';

@injectable()
export class DemoModelSource extends LocalModelSource {
    expansionState: ExpansionState = {};

    override initialize(registry: ActionHandlerRegistry): void {
        super.initialize(registry);
        registry.register(CollapseExpandAction.KIND, this);
        registry.register(CollapseAllAction.KIND, this);
        registry.register(ExpandAllAction.KIND, this);
    }

    override handle(action: Action): void {
        switch (action.kind) {
            case CollapseExpandAction.KIND:
                this.handleCollapseExpandAction(action as CollapseExpandAction);
                break;
            case CollapseAllAction.KIND:
                this.handleCollapseAllAction(action as CollapseAllAction);
                break;
            case ExpandAllAction.KIND:
                this.handleExpandAllAction(action as ExpandAllAction);
                break;
            default:
                super.handle(action);
                break;
        }
    }
    handleExpandAllAction(action: ExpandAllAction) {
        const data = require('./data.json');
        const preprocessedGraph = preprocess(data, this.expansionState, true);
        const model = generate(preprocessedGraph, this.expansionState);

        this.updateModel(model); 
    }

    handleCollapseAllAction(action: CollapseAllAction) {
        this.expansionState = {};

        const data = require('./data.json');

        const preprocessedGraph = preprocess(data, this.expansionState);
        const model = generate(preprocessedGraph, this.expansionState);

        this.updateModel(model); 
    }

    handleCollapseExpandAction(action: CollapseExpandAction) {
        action.expandIds.forEach(id => {
            this.expansionState[id] = true;
        })
        action.collapseIds.forEach(id => {
            this.expansionState[id] = false;

            Object.keys(this.expansionState).forEach(key => {
                if (key.startsWith(id)) {
                    this.expansionState[key] = false;
                }
            })

        })

        const data = require('./data.json');

        const preprocessedGraph = preprocess(data, this.expansionState);
        const model = generate(preprocessedGraph, this.expansionState);

        this.updateModel(model);
    }
}