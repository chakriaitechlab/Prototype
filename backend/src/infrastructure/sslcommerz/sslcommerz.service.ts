import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const SANDBOX_BASE_URL = 'https://sandbox.sslcommerz.com';
const LIVE_BASE_URL = 'https://securepay.sslcommerz.com';
const SESSION_PATH = '/gwprocess/v4/api.php';
const VALIDATION_PATH = '/validator/api/validationserverAPI.php';
const REQUEST_TIMEOUT_MS = 15_000;
const VALID_STATUSES = new Set(['VALID', 'VALIDATED']);

export interface SslcommerzSessionInput {
  tranId: string;
  amount: number;
  currency: string;
  productName: string;
  customer: { name: string; email: string; phone: string };
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl: string;
}

export interface SslcommerzValidation {
  tranId: string;
  valId: string;
  amount: number;
  currency: string;
  method: string | null;
  bankTranId: string | null;
}

interface SessionResponse {
  status?: string;
  failedreason?: string;
  GatewayPageURL?: string;
}

interface ValidationResponse {
  status?: string;
  tran_id?: string;
  val_id?: string;
  amount?: string;
  currency?: string;
  card_type?: string;
  bank_tran_id?: string;
}

@Injectable()
export class SslcommerzService {
  private readonly logger = new Logger(SslcommerzService.name);
  private readonly baseUrl: string;
  private readonly storeId: string;
  private readonly storePassword: string;

  constructor(configService: ConfigService) {
    this.baseUrl = configService.get<string>('SSLCOMMERZ_IS_LIVE') === 'true' ? LIVE_BASE_URL : SANDBOX_BASE_URL;
    this.storeId = configService.get<string>('SSLCOMMERZ_STORE_ID', '');
    this.storePassword = configService.get<string>('SSLCOMMERZ_STORE_PASSWORD', '');
  }

  async createSession(input: SslcommerzSessionInput): Promise<string> {
    this.assertConfigured();

    const form = new URLSearchParams({
      store_id: this.storeId,
      store_passwd: this.storePassword,
      total_amount: input.amount.toFixed(2),
      currency: input.currency,
      tran_id: input.tranId,
      success_url: input.successUrl,
      fail_url: input.failUrl,
      cancel_url: input.cancelUrl,
      ipn_url: input.ipnUrl,
      product_name: input.productName,
      product_category: 'Subscription',
      product_profile: 'non-physical-goods',
      shipping_method: 'NO',
      num_of_item: '1',
      cus_name: input.customer.name,
      cus_email: input.customer.email,
      cus_phone: input.customer.phone,
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
    });

    const body = await this.request<SessionResponse>(`${this.baseUrl}${SESSION_PATH}`, {
      method: 'POST',
      body: form,
    });

    if (body.status !== 'SUCCESS' || !body.GatewayPageURL) {
      this.logger.error(`SSLCommerz session failed: ${body.failedreason ?? 'unknown reason'}`);
      throw new ServiceUnavailableException('Could not start the payment. Please try again later.');
    }

    return body.GatewayPageURL;
  }

  async validate(valId: string): Promise<SslcommerzValidation | null> {
    this.assertConfigured();

    const query = new URLSearchParams({
      val_id: valId,
      store_id: this.storeId,
      store_passwd: this.storePassword,
      format: 'json',
    });

    const body = await this.request<ValidationResponse>(`${this.baseUrl}${VALIDATION_PATH}?${query}`, {
      method: 'GET',
    });

    if (!body.status || !VALID_STATUSES.has(body.status) || !body.tran_id || !body.val_id) {
      return null;
    }

    return {
      tranId: body.tran_id,
      valId: body.val_id,
      amount: Number(body.amount),
      currency: body.currency ?? '',
      method: body.card_type || null,
      bankTranId: body.bank_tran_id || null,
    };
  }

  private assertConfigured() {
    if (!this.storeId || !this.storePassword) {
      this.logger.error('SSLCOMMERZ_STORE_ID or SSLCOMMERZ_STORE_PASSWORD is not configured');
      throw new ServiceUnavailableException('Payments are not available right now. Please try again later.');
    }
  }

  private async request<T>(url: string, init: RequestInit): Promise<T> {
    let response: Response;
    try {
      response = await fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    } catch (err) {
      this.logger.error(`SSLCommerz unreachable: ${(err as Error).message}`);
      throw new ServiceUnavailableException('Payment gateway is unreachable. Please try again later.');
    }

    if (!response.ok) {
      this.logger.error(`SSLCommerz error ${response.status}`);
      throw new ServiceUnavailableException('Payment gateway error. Please try again later.');
    }

    return (await response.json().catch(() => ({}))) as T;
  }
}
