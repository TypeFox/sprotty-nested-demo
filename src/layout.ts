import { LayoutOptions } from 'elkjs';
import {injectable} from 'inversify'
import { DefaultLayoutConfigurator } from 'sprotty-elk';
import { SGraph, SLabel, SModelIndex, SNode } from 'sprotty-protocol';

@injectable()
export class DemoLayoutConfigurator extends DefaultLayoutConfigurator {
    protected override graphOptions(sgraph: SGraph, index: SModelIndex): LayoutOptions {
        return {
            'org.eclipse.elk.algorithm': 'org.eclipse.elk.layered',
            'org.eclipse.elk.edgeRouting': 'POLYLINE',
        }
    }
    
    protected override nodeOptions(snode: SNode, index: SModelIndex): LayoutOptions {
        return {
            'org.eclipse.elk.direction': 'UP',
            'org.eclipse.elk.layered.considerModelOrder': 'PREFER_EDGES'
        }
    }
}