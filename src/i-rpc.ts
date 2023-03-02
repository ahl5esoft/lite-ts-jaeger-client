export interface IApiDyanmicResponse<T> {
    /**
     * 错误码
     */
    err: number;
    /**
     * 响应数据
     */
    data: T;
}

export interface IRpcCallOption {
    route: string;
    body?: { [key: string]: any; };
    header?: { [key: string]: string; };
}

export interface IRpc {
    /**
     * @example
     * ```typescript
     *  const rpc: RpcBase;
     *  const resp = await rpc.call<T>('/服务名/端/api名');
     *  // res is T, 如果resp.err!=0则会抛错
     * ```
     */
    call<T>(v: IRpcCallOption): Promise<T>;

    /**
     * @example
     * ```typescript
     *  const rpc: RpcBase;
     *  const resp = await rpc.callWithoutThrow<T>('/app/api');
     *  // resp is IApiDyanmicResponse<T>
     * ```
     */
    callWithoutThrow<T>(v: IRpcCallOption): Promise<IApiDyanmicResponse<T>>;
}