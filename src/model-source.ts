import { injectable } from 'inversify';
import { ActionHandlerRegistry, LocalModelSource } from 'sprotty';
import { Action, CollapseExpandAction } from 'sprotty-protocol';
import { ExpansionState } from './model';
import { generate } from './generator';

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
        })

        const data = require('./data.json');

        const model = generate(data, this.expansionState);

        this.updateModel(model);
    }
}