import { IsEnum } from 'class-validator';
import { Role } from '../../../../../generated/prisma/enums.js';

export class UpdateRoleDto {
  @IsEnum(Role, { message: 'Role must be either SEEKER or RECRUITER' })
  role!: Role;
}
