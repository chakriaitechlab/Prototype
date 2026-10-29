import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { StorageModule } from '../../infrastructure/storage/storage.module.js';
import { OnboardingController } from './onboarding.controller.js';
import { RoleService } from './role/role.service.js';
import { SeekerService } from './seeker/seeker.service.js';
import { RecruiterService } from './recruiter/recruiter.service.js';
import { PhoneService } from './phone/phone.service.js';
import { UsernameService } from './username/username.service.js';

@Module({
  imports: [AuthModule, StorageModule],
  controllers: [OnboardingController],
  providers: [RoleService, SeekerService, RecruiterService, PhoneService, UsernameService],
})
export class OnboardingModule {}
