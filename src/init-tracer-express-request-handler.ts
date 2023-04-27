import { opentracing } from 'jaeger-client';
import { ExpressRequestHandlerBase, RequestHandlerContext } from 'lite-ts-express';
import { TracerBase } from 'lite-ts-tracer';

export class JaegerClientInitTracerExpressRequestHandler extends ExpressRequestHandlerBase {
    public constructor(
        private m_Tracer: TracerBase
    ) {
        super();
    }

    public async handle(ctx: RequestHandlerContext) {
        ctx.tracerSpan = this.m_Tracer?.startSpan?.(ctx.req.path, {
            childOf: this.m_Tracer?.extract?.(opentracing.FORMAT_HTTP_HEADERS, ctx.req.headers),
            tags: {
                [opentracing.Tags.SPAN_KIND]: opentracing.Tags.SPAN_KIND_RPC_SERVER,
                [opentracing.Tags.HTTP_METHOD]: ctx.req.method,
            }
        });
        await this.next?.handle(ctx);
    }
}