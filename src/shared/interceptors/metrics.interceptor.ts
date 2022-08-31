import type {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import type { Request } from 'express';
import { Counter, Histogram } from 'prom-client';
import { tap } from 'rxjs/operators';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_requests_count') private counter: Counter<string>,
    @InjectMetric('http_requests_bucket') private histogram: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    const endpoint = request.path;
    const method = request.method;

    const end = this.histogram.startTimer({ endpoint, method });

    return next.handle().pipe(
      tap(() => {
        this.counter.inc({ endpoint, method });
        end();
      }),
    );
  }
}
