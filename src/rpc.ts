import { opentracing } from 'jaeger-client';

import { IRpc, IRpcCallOption } from './i-rpc';
import { ITraceable } from './i-traceable';

/**
 * 包装器
 */
export class JaegerClientRpc implements IRpc, ITraceable<IRpc> {
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
        private m_BuildErrorFunc: (errorCode: number, data: any) => Error,
        private m_BuildRpcFunc: () => IRpc,
        private m_Tracer: opentracing.Tracer,
        tracerSpan: opentracing.Span,
    ) {
        this.m_TracerSpan = tracerSpan ? this.m_Tracer.startSpan('rpc', {
            childOf: tracerSpan,
        }) : null;
    }

    public async call<T>(v: IRpcCallOption) {
        const resp = await this.callWithoutThrow<T>(v);
        if (resp.err)
            throw this.m_BuildErrorFunc(resp.err, resp.data);

        return resp.data;
    }

    public async callWithoutThrow<T>(v: IRpcCallOption) {
        v.header ??= {};

        if (this.m_TracerSpan) {
            this.m_TracerSpan.log(v);
            this.m_Tracer.inject(this.m_TracerSpan, opentracing.FORMAT_HTTP_HEADERS, v.header);
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
            this.m_BuildErrorFunc,
            this.m_BuildRpcFunc,
            this.m_Tracer,
            parentSpan
        ) : this;
    }
}