import { Injectable } from '@nestjs/common';
import { HireJobsService } from '../../../recruiter/hire/jobs/jobs.service.js';
import { OPPORTUNITY_STATUSES } from '../../../recruiter/hire/jobs/dto/update-job.dto.js';
import { CandidatesService } from '../../../recruiter/talent/candidates/candidates.service.js';
import { StatsService } from '../../../recruiter/talent/stats/stats.service.js';
import { JobDetailDto } from './dto/job-detail.dto.js';
import { ListMyJobsDto, MY_JOBS_MAX_LIMIT } from './dto/list-my-jobs.dto.js';
import { CANDIDATE_SEARCH_MAX_LIMIT, SearchCandidatesDto } from './dto/search-candidates.dto.js';
import type { AgentTool, ToolContext, ToolResult } from './tools.service.js';

const DEFAULT_JOBS_LIMIT = 10;
const DEFAULT_CANDIDATES_LIMIT = 10;
const RECRUITER_ONLY: AgentTool['roles'] = ['RECRUITER'];

@Injectable()
export class RecruiterToolsService {
  readonly tools: AgentTool[] = [
    {
      definition: {
        type: 'function',
        function: {
          name: 'list_my_jobs',
          description: 'List the recruiter\'s own job posts on Chakri.ai with status and applicant count.',
          parameters: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: [...OPPORTUNITY_STATUSES], description: 'Only jobs with this status' },
              search: { type: 'string', description: 'Filter by job title' },
              limit: { type: 'number', description: `How many jobs to return, 1-${MY_JOBS_MAX_LIMIT}` },
            },
            required: [],
          },
        },
      },
      roles: RECRUITER_ONLY,
      input: ListMyJobsDto,
      run: (input: ListMyJobsDto, context: ToolContext) => this.listJobs(input, context),
    },
    {
      definition: {
        type: 'function',
        function: {
          name: 'job_detail',
          description: 'Get the full details of one of the recruiter\'s job posts by its id from list_my_jobs.',
          parameters: { type: 'object', properties: { jobId: { type: 'string', description: 'Job id from list_my_jobs' } }, required: ['jobId'] },
        },
      },
      roles: RECRUITER_ONLY,
      input: JobDetailDto,
      run: (input: JobDetailDto, context: ToolContext) => this.jobDetail(input, context),
    },
    {
      definition: {
        type: 'function',
        function: {
          name: 'search_candidates',
          description: 'Search job seekers on Chakri.ai by name, headline, skills or location. Returns profile summaries.',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Words to match, e.g. "React developer Dhaka"' },
              limit: { type: 'number', description: `How many candidates to return, 1-${CANDIDATE_SEARCH_MAX_LIMIT}` },
            },
            required: [],
          },
        },
      },
      roles: RECRUITER_ONLY,
      input: SearchCandidatesDto,
      run: (input: SearchCandidatesDto, context: ToolContext) => this.searchCandidates(input, context),
    },
    {
      definition: {
        type: 'function',
        function: {
          name: 'hiring_stats',
          description: 'Get the recruiter\'s hiring summary: number of job posts, applicants and hires.',
          parameters: { type: 'object', properties: {}, required: [] },
        },
      },
      roles: RECRUITER_ONLY,
      run: (_input: object, context: ToolContext) => this.hiringStats(context),
    },
  ];

  constructor(
    private readonly jobs: HireJobsService,
    private readonly candidates: CandidatesService,
    private readonly stats: StatsService,
  ) {}

  private async listJobs({ status, search, limit }: ListMyJobsDto, { userId }: ToolContext): Promise<ToolResult> {
    const { items, total } = await this.jobs.list(userId, { page: 1, limit: limit ?? DEFAULT_JOBS_LIMIT, status, search });
    return { content: items.length ? JSON.stringify({ total, jobs: items }) : 'No job posts found.' };
  }

  private async jobDetail({ jobId }: JobDetailDto, { userId }: ToolContext): Promise<ToolResult> {
    return { content: JSON.stringify(await this.jobs.findOne(userId, jobId)) };
  }

  private async searchCandidates({ query, limit }: SearchCandidatesDto, { userId }: ToolContext): Promise<ToolResult> {
    const { items, total } = await this.candidates.list(userId, { q: query, page: 1, limit: limit ?? DEFAULT_CANDIDATES_LIMIT });
    return { content: items.length ? JSON.stringify({ total, candidates: items }) : 'No candidates found.' };
  }

  private async hiringStats({ userId }: ToolContext): Promise<ToolResult> {
    const [{ applicants, hired }, { allTotal }] = await Promise.all([
      this.stats.stats(userId),
      this.jobs.list(userId, { page: 1, limit: 1 }),
    ]);
    return { content: JSON.stringify({ jobPosts: allTotal, applicants, hired }) };
  }
}
