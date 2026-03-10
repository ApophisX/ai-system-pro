/**
 * 消息队列配置
 *
 * RabbitMQ、Kafka 等消息队列配置
 */

import { registerAs } from '@nestjs/config';

export const mqConfig = registerAs('mq', () => ({
  type: process.env.MQ_TYPE || 'rabbitmq',
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    prefetch: parseInt(process.env.RABBITMQ_PREFETCH || '10', 10),
  },
  kafka: {
    brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
    clientId: process.env.KAFKA_CLIENT_ID,
  },
}));

export type MQConfig = ReturnType<typeof mqConfig>;
