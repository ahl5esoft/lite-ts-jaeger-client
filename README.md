# 链路追踪

![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

## 安装
```
npm install lite-ts-jaeger-client
```

## 使用

```typescript
import { ChildTracer, RootTracer } from 'lite-ts-jaeger-client';

// 非入口服务使用
const tracer = new ChildTracer(
    {
        serviceName: 'framework-dev-gateway',
        reporter: {
            collectorEndpoint: 'http://10.10.0.66:14268/api/traces'
        },
        sampler: {
            type: 'const',
            param: 1
        }
    },
    {
        tags: {
            version: '1.0.0'
        }
    }
);

// 一般在入口服务使用，例如网关
const rootTracer = new RootTracer(
    {
        serviceName: 'framework-dev-gateway',
        reporter: {
            collectorEndpoint: 'http://10.10.0.66:14268/api/traces'
        },
        sampler: {
            type: 'const',
            param: 1
        }
    },
    {
        tags: {
            version: '1.0.0'
        }
    },
    async (name: string, tags: { [key: string]: any }) => {
        // 当前Span是否要记录
        return true;
    }
);

const req: Request;
const parentSpan = tracer.extract(opentracing.FORMAT_HTTP_HEADERS, headers); // 获取父Span

const span = tracer.startSpan('/app/mh/test', {
    childOf: parentSpan
});

span.log({
    body: req.body,
    headers: req.headers
});

span.addTags({
    'error': true,
    'otherTag': 'tagValue'
});
span.setTag('authID', 'userID1');

span.finish();
```
