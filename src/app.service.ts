/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { createUserRequest } from './dto/create-user.request';
import { EventEmitter } from 'stream';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from './events/user-created.event';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class AppService {
  constructor(private readonly eventEmitter: EventEmitter2, private schedulerRegistry: SchedulerRegistry) {}

  private readonly logger = new Logger(AppService.name);
  getHello(): string {
    return 'Hello World!';
  }

  async createUser(body: createUserRequest) {
    this.logger.log('Creating user...', body);
    const userId = '123';
    this.eventEmitter.emit('user.created', new UserCreatedEvent(userId, body.email));
    const establishWsTimeout = setTimeout(() => this.establishWsConnection(userId), 5000);
    this.schedulerRegistry.addTimeout(`${userId}_establish_ws`, establishWsTimeout)
  }

  private establishWsConnection(userId: string) {
    this.logger.log('Establishing Web Socket connection with user...', userId);
  }

  @OnEvent('user.created')
  welcomeNewUser(payload: UserCreatedEvent) {
    this.logger.log('Welcoming new user...', payload.email);
  }

  @OnEvent('user.created', { async: true })
  async sendWelcomeGift(payload: UserCreatedEvent) {
    this.logger.log('Sending welcome gift...', payload.email)
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 3000));
    this.logger.log('Welcome gift sent.', payload.email)
  }

   @Cron(CronExpression.EVERY_10_SECONDS, { name: 'delete_expired_users'})
   deleteExpiredUsers() {
     this.logger.log('Deleting expired users....')
   }
}
