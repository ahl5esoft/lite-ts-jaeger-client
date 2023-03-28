import { opentracing } from 'jaeger-client';
import { RpcBase, RpcCallOption } from 'lite-ts-rpc';

import { ITraceable } from './i-traceable';

/**
 * 包装器
 */
export class JaegerClientRpc extends RpcBase implements ITraceable<RpcBase> {
    /**
     * 跟踪范围
     */
    private m_TracerSpan: opentracing.Span;

    /**
     * 构造函数
     * 
     * @param m_BuildRpcFunc 创建rpc函数
     * @param tracerSpan 父跟踪范围
     */
    public constructor(
        private m_BuildRpcFunc: () => RpcBase,
        private m_Tracer: opentracing.Tracer,
        tracerSpan: opentracing.Span,
    ) {
        super();

        this.m_TracerSpan = tracerSpan ? this.m_Tracer?.startSpan('rpc', {
            childOf: tracerSpan,
        }) : null;
    }

    public async callWithoutThrow<T>(v: RpcCallOption) {
        v.header ??= {};

        if (this.m_TracerSpan) {
            this.m_TracerSpan.log(v);
            this.m_Tracer?.inject(this.m_TracerSpan, opentracing.FORMAT_HTTP_HEADERS, v.header);
        }

        const resp = await this.m_BuildRpcFunc().callWithoutThrow<T>(v);

        if (this.m_TracerSpan) {
            this.m_TracerSpan.log({
                result: resp
            });
            if (resp.err)
                this.m_TracerSpan.setTag(opentracing.Tags.ERROR, true);

            this.m_TracerSpan.finish();
        }

        return resp;
    }

    public withTrace(parentSpan: opentracing.Span) {
        return parentSpan ? new JaegerClientRpc(
            this.m_BuildRpcFunc,
            this.m_Tracer,
            parentSpan
        ) : this;
    }
}