import { opentracing } from 'jaeger-client';
import { RpcBase, RpcCallOption } from 'lite-ts-rpc';
import { ITraceable, ITracerSpan, TracerBase } from 'lite-ts-tracer';

export class JaegerClientRpc extends RpcBase implements ITraceable<RpcBase> {
    private m_TracerSpan: ITracerSpan;

    /**
     * 构造函数
     * 
     * @param m_Rpc 创建rpc函数
     * @param m_Tracer 追踪器
     * @param parentTracerSpan 父跟踪范围
     */
    public constructor(
        private m_Rpc: RpcBase,
        private m_Tracer: TracerBase,
        parentTracerSpan?: ITracerSpan
    ) {
        super();

        this.m_TracerSpan = parentTracerSpan ? this.m_Tracer?.startSpan('rpc', {
            childOf: parentTracerSpan,
        }) : null;
    }

    protected async onCall<T>(v: RpcCallOption) {
        v.header ??= {};

        if (this.m_TracerSpan) {
            this.m_TracerSpan.log(v);
            this.m_Tracer?.inject(this.m_TracerSpan, opentracing.FORMAT_HTTP_HEADERS, v.header);
        }

        const resp = await this.m_Rpc.call<T>({
            ...v,
            isThrow: false
        });

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

    public withTrace(parentSpan: ITracerSpan) {
        return parentSpan ? new JaegerClientRpc(
            this.m_Rpc,
            this.m_Tracer,
            parentSpan
        ) : this;
    }
}