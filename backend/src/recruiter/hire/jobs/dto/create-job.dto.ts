import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export const JOB_TYPES = ['Full Time', 'Part Time', 'Internship', 'Contract'] as const;
export const SALARY_MODES = ['range', 'negotiable'] as const;
export const SALARY_CURRENCIES = ['BDT', 'USD'] as const;
export const SALARY_TYPES = ['Hourly', 'Monthly', 'Yearly'] as const;
export const EDUCATION_LEVELS = ['High School', 'Diploma', 'Graduation', 'Masters', 'PhD', 'Any'] as const;
export const EXPERIENCE_LEVELS = ['Fresh', '1 Year', '2 Years', '3 Years', '4 Years', '5+ Years'] as const;
export const JOB_LEVELS = ['Entry Level', 'Mid Level', 'Senior Level', 'Director', 'Executive'] as const;
export const COUNTRIES = ['Bangladesh'] as const;
export const DIVISIONS = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'] as const;
export const APPLY_METHODS = ['platform', 'external', 'email'] as const;
export const INTERVIEW_DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
export const AUTO_PILOT_MODES = ['threshold', 'all', 'off'] as const;
export const JOB_BENEFITS = [
  'Distributed Team',
  'Medical Insurance',
  '401k matching',
  'Company retreats',
  'We hire old (and young)',
  '401k Salary',
  'Async',
  'Vision Insurance',
  'Dental Insurance',
  'Unlimited vacation',
  '4 day workweek',
  'Learning budget',
  'Free gym membership',
  'Pay in crypto',
  'Profit Sharing',
  'Equity Compensation',
  'No whiteboard interview',
  'No politics at work',
] as const;

const MAX_TAGS = 20;
const MAX_SALARY = 1_000_000_000;

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const emptyToUndefined = ({ value }: { value: unknown }) => (value === '' || value === null ? undefined : value);
const toOptionalNumber = ({ value }: { value: unknown }) =>
  value === '' || value === null || value === undefined ? undefined : Number(value);
const splitTags = ({ value }: { value: unknown }) =>
  typeof value === 'string'
    ? value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : value;

export class CreateJobDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Job title is required' })
  @MaxLength(200, { message: 'Job title cannot exceed 200 characters' })
  title!: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Job role cannot exceed 100 characters' })
  jobRole?: string;

  @Transform(splitTags)
  @IsArray()
  @ArrayMaxSize(MAX_TAGS, { message: `You can add up to ${MAX_TAGS} tags` })
  @IsString({ each: true })
  @MaxLength(50, { each: true, message: 'Each tag cannot exceed 50 characters' })
  tags: string[] = [];

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Job description is required' })
  @MaxLength(10000, { message: 'Job description cannot exceed 10000 characters' })
  description!: string;

  @IsIn(JOB_TYPES, { message: 'Invalid job type' })
  jobType!: (typeof JOB_TYPES)[number];

  @IsIn(SALARY_MODES, { message: 'Invalid salary mode' })
  salaryMode!: (typeof SALARY_MODES)[number];

  @Transform(toOptionalNumber)
  @ValidateIf((dto: CreateJobDto, value) => dto.salaryMode === 'range' && value !== undefined)
  @IsInt({ message: 'Minimum salary must be a whole number' })
  @Min(0, { message: 'Minimum salary cannot be negative' })
  @Max(MAX_SALARY, { message: 'Minimum salary is too large' })
  salaryMin?: number;

  @Transform(toOptionalNumber)
  @ValidateIf((dto: CreateJobDto, value) => dto.salaryMode === 'range' && value !== undefined)
  @IsInt({ message: 'Maximum salary must be a whole number' })
  @Min(0, { message: 'Maximum salary cannot be negative' })
  @Max(MAX_SALARY, { message: 'Maximum salary is too large' })
  salaryMax?: number;

  @IsIn(SALARY_CURRENCIES, { message: 'Invalid salary currency' })
  salaryCurrency!: (typeof SALARY_CURRENCIES)[number];

  @IsIn(SALARY_TYPES, { message: 'Invalid salary type' })
  salaryType!: (typeof SALARY_TYPES)[number];

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsIn(EDUCATION_LEVELS, { message: 'Invalid education level' })
  education?: (typeof EDUCATION_LEVELS)[number];

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsIn(EXPERIENCE_LEVELS, { message: 'Invalid experience level' })
  experience?: (typeof EXPERIENCE_LEVELS)[number];

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsIn(JOB_LEVELS, { message: 'Invalid job level' })
  jobLevel?: (typeof JOB_LEVELS)[number];

  @Type(() => Number)
  @IsInt({ message: 'Vacancies must be a whole number' })
  @Min(1, { message: 'Vacancies must be at least 1' })
  @Max(99, { message: 'Vacancies cannot exceed 99' })
  vacancies: number = 1;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Expiration date must be a valid date' })
  deadline?: string;

  @IsIn(COUNTRIES, { message: 'Invalid country' })
  country!: (typeof COUNTRIES)[number];

  @IsIn(DIVISIONS, { message: 'Invalid city / division' })
  city!: (typeof DIVISIONS)[number];

  @IsBoolean()
  isRemote: boolean = false;

  @IsArray()
  @ArrayUnique()
  @IsIn(JOB_BENEFITS, { each: true, message: 'Invalid job benefit' })
  benefits: (typeof JOB_BENEFITS)[number][] = [];

  @IsArray()
  @ArrayMinSize(1, { message: 'Select at least one apply method' })
  @ArrayUnique()
  @IsIn(APPLY_METHODS, { each: true, message: 'Invalid apply method' })
  applyMethods!: (typeof APPLY_METHODS)[number][];

  @IsIn(INTERVIEW_DIFFICULTIES, { message: 'Invalid interview difficulty' })
  interviewDifficulty!: (typeof INTERVIEW_DIFFICULTIES)[number];

  @IsIn(AUTO_PILOT_MODES, { message: 'Invalid auto-pilot mode' })
  autoPilotMode!: (typeof AUTO_PILOT_MODES)[number];

  @Type(() => Number)
  @IsInt({ message: 'Interview threshold must be a whole number' })
  @Min(0, { message: 'Interview threshold must be between 0 and 100' })
  @Max(100, { message: 'Interview threshold must be between 0 and 100' })
  interviewThreshold!: number;
}
