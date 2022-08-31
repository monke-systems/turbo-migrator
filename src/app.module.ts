import { TurboConfigModule } from '@monkee/turbo-config';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  PrometheusModule,
  makeCounterProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';
import { AppConfig } from './config';
import { HealthcheckModule } from './healthcheck/healthcheck.module';
import { MigrateModule } from './migrate/migrate.module';
import { MetricsInterceptor } from './shared/interceptors/metrics.interceptor';

@Module({
  imports: [
    TurboConfigModule.forRootAsync(AppConfig, {
      envFiles: ['.env.development', '.env.development.local'],
      loadEnvFiles: process.env.NODE_ENV === 'development',
    }),
    PrometheusModule.register({
      path: '/metrics',
      defaultLabels: {
        appName: 'example-app',
      },
      defaultMetrics: {
        enabled: false,
      },
    }),
    HealthcheckModule,
    MigrateModule,
  ],
  providers: [
    makeCounterProvider({
      name: 'http_requests_count',
      help: 'http requests count',
      labelNames: ['endpoint', 'method'],
    }),
    makeHistogramProvider({
      name: 'http_requests_bucket',
      help: 'http requests bucket',
      labelNames: ['endpoint', 'method'],
    }),
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule {}
