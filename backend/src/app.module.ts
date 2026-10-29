import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './infrastructure/prisma/prisma.module.js';
import { RedisModule } from './infrastructure/redis/redis.module.js';
import { EmailModule } from './infrastructure/email/email.module.js';
import { WhatsappModule } from './infrastructure/whatsapp/whatsapp.module.js';
import { RateLimitModule } from './infrastructure/rate-limit/rate-limit.module.js';
import { StorageModule } from './infrastructure/storage/storage.module.js';
import { AiModule } from './infrastructure/ai/ai.module.js';
import { SpeechModule } from './infrastructure/speech/speech.module.js';
import { BrowserModule } from './infrastructure/browser/browser.module.js';
import { SslcommerzModule } from './infrastructure/sslcommerz/sslcommerz.module.js';
import { AuthModule } from './common/auth/auth.module.js';
import { OnboardingModule } from './common/onboarding/onboarding.module.js';
import { GovtJobsModule } from './seeker/govt-jobs/govt-jobs.module.js';
import { SupportModule } from './common/support/support.module.js';
import { WaitlistModule } from './common/waitlist/waitlist.module.js';
import { ProfileModule } from './seeker/profile/profile.module.js';
import { JobsModule } from './seeker/jobs/jobs.module.js';
import { PublicJobsModule } from './common/jobs/jobs.module.js';
import { NotificationsModule } from './common/notifications/notifications.module.js';
import { SettingsModule } from './common/settings/settings.module.js';
import { MessagesModule } from './common/messages/messages.module.js';
import { InterviewsModule } from './common/interviews/interviews.module.js';
import { CvModule } from './seeker/cv/cv.module.js';
import { LearnModule } from './seeker/learn/learn.module.js';
import { AgentModule } from './common/agent/agent.module.js';
import { PaymentsModule } from './common/payments/payments.module.js';
import { DiamondsModule } from './common/diamonds/diamonds.module.js';
import { TalentModule } from './recruiter/talent/talent.module.js';
import { HireModule } from './recruiter/hire/hire.module.js';
import { FavoritesModule } from './recruiter/favorites/favorites.module.js';
import { CompanyModule } from './recruiter/company/company.module.js';
import { AdminModule } from './admin/admin.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    EmailModule,
    WhatsappModule,
    RateLimitModule,
    StorageModule,
    AiModule,
    SpeechModule,
    BrowserModule,
    SslcommerzModule,
    AuthModule,
    OnboardingModule,
    GovtJobsModule,
    SupportModule,
    WaitlistModule,
    ProfileModule,
    JobsModule,
    PublicJobsModule,
    NotificationsModule,
    SettingsModule,
    MessagesModule,
    InterviewsModule,
    CvModule,
    LearnModule,
    AgentModule,
    PaymentsModule,
    DiamondsModule,
    TalentModule,
    HireModule,
    FavoritesModule,
    CompanyModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
