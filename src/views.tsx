/** @jsx svg */
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';
import { CircularNodeView, Hoverable, IView, IViewArgs, PolylineEdgeView, RenderingContext, SButtonImpl, SEdgeImpl, SShapeElementImpl, Selectable, findParentByFeature, isExpandable } from 'sprotty';
import { Point, toDegrees } from 'sprotty-protocol';
import { svg } from 'sprotty/lib/lib/jsx';

@injectable()
export class ExpandButtonView implements IView {
    render(button: SButtonImpl, context: RenderingContext): VNode {
        const expandable = findParentByFeature(button, isExpandable);
        const path = expandable !== undefined && expandable.expanded
            ? 'M 1,5 L 8,12 L 15,5 Z'
            : 'M 1,1 L 8,8 L 1,15 Z';
        return <g class-sprotty-button="{true}" class-enabled="{button.enabled}">
            <rect x={0} y={0} width={16} height={16} opacity={0}></rect>
            <path d={path}></path>
        </g>;
    }
}

@injectable()
export class PolylineEdgeViewWithArrow extends PolylineEdgeView {
        protected override renderAdditionals(edge: SEdgeImpl, segments: Point[], context: RenderingContext): VNode[] {
            const p1 = segments[segments.length - 1];
            const p2 = segments[segments.length - 2];
            return [
                <path class-arrowhead={true} 
                d="M 7,-3 L 0,0 L 7,3 Z"
                transform={`rotate(${this.angle(p1,p2)} ${p1.x} ${p1.y}) translate(${p1.x} ${p1.y})`}
                />
            ]
        }

        angle(x0: Point, x1: Point) {
            return toDegrees(Math.atan2(x1.y - x0.y, x1.x - x0.x));
        }
}

@injectable()
export class PortView extends CircularNodeView {
    render(node: Readonly<SShapeElementImpl & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode {
        const parent = node.parent;
        const childrenEdges = parent.children.filter(child => child instanceof SEdgeImpl);
        const hasPort = parent.children.filter(child => child instanceof SEdgeImpl && (child.sourceId.startsWith('port-') || child.targetId.startsWith('port'))).length > 0;

        if (hasPort) {
            return super.render(node, context, args);
        }
    }
}