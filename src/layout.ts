import { LayoutOptions } from 'elkjs';
import { injectable } from 'inversify';
import { DefaultLayoutConfigurator } from 'sprotty-elk';
import { SGraph, SLabel, SModelIndex, SNode, SPort } from 'sprotty-protocol';

@injectable()
export class DemoLayoutConfigurator extends DefaultLayoutConfigurator {
    protected override graphOptions(sgraph: SGraph, index: SModelIndex): LayoutOptions {
        return {
            'org.eclipse.elk.algorithm': 'org.eclipse.elk.layered',
            'org.eclipse.elk.edgeRouting': 'POLYLINE',
            'org.eclipse.elk.hierarchyHandling': 'INCLUDE_CHILDREN',
            'org.eclipse.elk.direction': 'UP',
            'org.eclipse.elk.layered.considerModelOrder.strategy': 'PREFER_NODES',
            'org.eclipse.elk.portAlignment.default': 'CENTER',

        }
    }
    
    protected override nodeOptions(snode: SNode, index: SModelIndex): LayoutOptions {
        return {
            'org.eclipse.elk.direction': 'UP',
            'org.eclipse.elk.layered.considerModelOrder': 'PREFER_NODES',
            'org.eclipse.elk.nodeSize.constraints': 'NODE_LABELS',
            'org.eclipse.elk.nodeLabels.placement': 'INSIDE V_TOP H_CENTER',
            'org.eclipse.elk.nodeLabels.padding': '[top=10, bottom=0, left=20, right=20]',
            'org.eclipse.elk.portAlignment.default': 'CENTER',
        }
    }

    protected override portOptions(sport: SPort, index: SModelIndex): LayoutOptions {
        return {
            'org.eclipse.elk.port.borderOffset': '-4',
            'org.eclipse.elk.port.anchor': '(4,8)'
        }    
    }
}