import { Transform } from 'class-transformer';
import { IsNotIn, Matches } from 'class-validator';

const RESERVED_USERNAMES = [
  'about', 'admin', 'ai-tools', 'api', 'auth', 'candidates', 'careers', 'chakri',
  'chakri-apply-site', 'chakri-pro', 'company', 'credits', 'dashboard', 'demo', 'docs',
  'employers', 'forgot-password', 'help', 'hire', 'jobs', 'login', 'logout', 'me', 'mobile',
  'null', 'onboarding', 'post', 'pricing', 'privacy', 'profile', 'recruiter', 'recruiterdemo',
  'refer', 'reset-password', 'root', 'seeker', 'seekerdemo', 'settings', 'shared', 'signup',
  'sso', 'support', 'system', 'terms', 'undefined', 'user', 'verify-email', 'waitlist', 'www',
];

const BLOCKED_TERMS = [
  'asshole', 'bastard', 'bitch', 'cunt', 'dick', 'fuck', 'motherfucker', 'piss', 'pussy',
  'shit', 'slut', 'whore', 'adult', 'camgirl', 'escort', 'hentai', 'nude', 'nsfw',
  'onlyfans', 'porn', 'redtube', 'sex', 'xnxx', 'xvideos', 'xxx', '1xbet', 'bet', 'casino',
  'gamble', 'jackpot', 'lottery', 'poker', 'slot', 'sportsbook', 'stake', 'crime', 'fraud',
  'killer', 'murder', 'rape', 'robber', 'scam', 'terror', 'theft', 'thief', 'love', 'sorry',
];

const WITHOUT_BLOCKED_TERMS = new RegExp(`^(?!.*(?:${BLOCKED_TERMS.join('|')})).*$`);

export class UsernameDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase().replace(/\s+/g, '') : value,
  )
  @Matches(/^[a-z][a-z0-9_]{2,29}$/, {
    message:
      'Username must be 3–30 characters, start with a letter, and use only lowercase letters, numbers, or underscores',
  })
  @IsNotIn(RESERVED_USERNAMES, { message: 'This username is reserved. Please choose another' })
  @Matches(WITHOUT_BLOCKED_TERMS, { message: 'This username is not allowed. Please choose another' })
  username!: string;
}
