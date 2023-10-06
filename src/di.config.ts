
import ElkConstructor from "elkjs/lib/elk.bundled";
import { Container, ContainerModule } from "inversify";
import { CircularNodeView, ConsoleLogger, LogLevel, RectangularNodeView, SButtonImpl, SCompartmentImpl, SCompartmentView, SEdgeImpl, SGraphImpl, SGraphView, SLabelImpl, SLabelView, SNodeImpl, SPortImpl, TYPES, configureModelElement, configureViewerOptions, edgeIntersectionModule, hoverFeedbackFeature, loadDefaultModules, moveFeature, selectFeature } from "sprotty";
import { ElkFactory, ElkLayoutEngine, ILayoutConfigurator, elkLayoutModule } from "sprotty-elk/lib/inversify";
import { DemoLayoutConfigurator } from "./layout";
import { DirectoryImpl } from "./model";
import { DemoModelSource } from "./model-source";
import { ExpandButtonView, PolylineEdgeViewWithArrow } from "./views";


const elkFactory: ElkFactory = () => new ElkConstructor();

export default (containerId: string) => {

    const DemoModule = new ContainerModule((bind, unbind, isBound, rebind) => {
        bind(TYPES.ModelSource).to(DemoModelSource).inSingletonScope();
        bind(ElkFactory).toConstantValue(elkFactory);
        rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
        rebind(TYPES.LogLevel).toConstantValue(LogLevel.log);
        rebind(ILayoutConfigurator).to(DemoLayoutConfigurator);
        bind(TYPES.IModelLayoutEngine).toDynamicValue(
            ctx => new ElkLayoutEngine(ctx.container.get(ElkFactory), undefined, ctx.container.get(ILayoutConfigurator))
        ).inSingletonScope();

        const context = { bind, unbind, isBound, rebind };

        configureModelElement(context, 'graph', SGraphImpl, SGraphView);
        configureModelElement(context, 'node:directory', DirectoryImpl, RectangularNodeView, {disable: [hoverFeedbackFeature, moveFeature]});
        configureModelElement(context, 'node:file', SNodeImpl, RectangularNodeView, {disable: [hoverFeedbackFeature, moveFeature]});
        configureModelElement(context, 'port', SPortImpl, CircularNodeView)
        configureModelElement(context, 'label', SLabelImpl, SLabelView);
        configureModelElement(context, 'button:expand', SButtonImpl, ExpandButtonView);
        configureModelElement(context, 'node:compartment', SCompartmentImpl, SCompartmentView);
        configureModelElement(context, 'edge', SEdgeImpl, PolylineEdgeViewWithArrow, {disable: [selectFeature]});

        configureViewerOptions(context, {
            needsClientLayout: true,
            baseDiv: containerId,
            needsServerLayout: true,
        });

    });

    const container = new Container();
    loadDefaultModules(container);
    container.load(elkLayoutModule,DemoModule, edgeIntersectionModule);
    return container;

}