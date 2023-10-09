import { injectable } from 'inversify';
import { ActionHandlerRegistry, LocalModelSource } from 'sprotty';
import { Action, CollapseExpandAction } from 'sprotty-protocol';
import { generate } from './generator';
import { ExpansionState } from './model';
import { preprocess } from './preprocessor';

@injectable()
export class DemoModelSource extends LocalModelSource {
    expansionState: ExpansionState = {};

    override initialize(registry: ActionHandlerRegistry): void {
        super.initialize(registry);
        registry.register(CollapseExpandAction.KIND, this);
    }

    override handle(action: Action): void {
        switch (action.kind) {
            case CollapseExpandAction.KIND:
                this.handleCollapseExpandAction(action as CollapseExpandAction);
                break;
            default:
                super.handle(action);
                break;
        }
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