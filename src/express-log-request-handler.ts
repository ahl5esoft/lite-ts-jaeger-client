import { opentracing } from 'jaeger-client';
import { ExpressRequestHandlerBase, RequestHandlerContext } from 'lite-ts-express';
import { LogFactoryBase } from 'lite-ts-log';

export class ExpressLogRequestHandler extends ExpressRequestHandlerBase {
    public constructor(
        private m_LogFactory: LogFactoryBase,
        private m_LabelKey: string,
        private m_GetLabelValueFunc: (ctx: RequestHandlerContext) => any,
        private m_IsFinish: boolean = false
    ) {
        super();
    }

    public async handle(ctx: RequestHandlerContext) {
        try {
            const labelValue = this.m_GetLabelValueFunc(ctx);
            if (!labelValue)
                return;

            ctx.log ??= this.m_LogFactory.build();
            ctx.log.addLabel(this.m_LabelKey, labelValue);
            if (ctx.tracerSpan) {
                ctx.tracerSpan.log({
                    [this.m_LabelKey]: labelValue,
                });
                if (ctx.err)
                    ctx.tracerSpan?.setTag(opentracing.Tags.ERROR, true);
            }
        } catch (ex) {
            ctx.err = ex;
        } finally {
            if (this.m_IsFinish) {
                if (!ctx.err)
                    ctx.log.info();
                ctx.tracerSpan?.finish();
            }

            await this.next?.handle(ctx);
        }
    }
}