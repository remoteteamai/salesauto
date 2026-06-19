import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface CalendlyEventType {
  uri: string;
  name: string;
  slug: string;
  scheduling_url: string;
  duration: number;
  active: boolean;
}

export interface CalendlyScheduledEvent {
  uri: string;
  name: string;
  status: string;
  start_time: string;
  end_time: string;
  event_type: string;
  invitees_counter: { total: number; active: number };
}

@Injectable()
export class CalendlyService {
  private readonly baseUrl = 'https://api.calendly.com';

  private getHeaders(): Record<string, string> {
    const token = process.env.CALENDLY_API_TOKEN;
    if (!token) {
      throw new HttpException('Calendly API token not configured', HttpStatus.SERVICE_UNAVAILABLE);
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getCurrentUser(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/users/me`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new HttpException('Failed to fetch Calendly user', HttpStatus.BAD_GATEWAY);
    return response.json();
  }

  async getEventTypes(): Promise<CalendlyEventType[]> {
    const user = await this.getCurrentUser();
    const userUri = user.resource.uri;
    const response = await fetch(
      `${this.baseUrl}/event_types?user=${encodeURIComponent(userUri)}&active=true`,
      { headers: this.getHeaders() },
    );
    if (!response.ok) throw new HttpException('Failed to fetch event types', HttpStatus.BAD_GATEWAY);
    const data = await response.json();
    return data.collection;
  }

  async getScheduledEvents(params?: { minStartTime?: string; maxStartTime?: string; status?: string }): Promise<CalendlyScheduledEvent[]> {
    const user = await this.getCurrentUser();
    const userUri = user.resource.uri;
    const queryParams = new URLSearchParams({ user: userUri });
    if (params?.minStartTime) queryParams.set('min_start_time', params.minStartTime);
    if (params?.maxStartTime) queryParams.set('max_start_time', params.maxStartTime);
    if (params?.status) queryParams.set('status', params.status);

    const response = await fetch(
      `${this.baseUrl}/scheduled_events?${queryParams.toString()}`,
      { headers: this.getHeaders() },
    );
    if (!response.ok) throw new HttpException('Failed to fetch scheduled events', HttpStatus.BAD_GATEWAY);
    const data = await response.json();
    return data.collection;
  }

  async getEventInvitees(eventUuid: string): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/scheduled_events/${eventUuid}/invitees`,
      { headers: this.getHeaders() },
    );
    if (!response.ok) throw new HttpException('Failed to fetch invitees', HttpStatus.BAD_GATEWAY);
    const data = await response.json();
    return data.collection;
  }

  getSchedulingUrl(): string {
    return process.env.CALENDLY_SCHEDULING_URL || 'https://calendly.com/salesautoai/demo';
  }

  async handleWebhook(payload: any): Promise<void> {
    const { event, payload: eventPayload } = payload;

    if (event === 'invitee.created') {
      const invitee = eventPayload?.invitee;
      if (invitee?.email) {
        // Log the booking for analytics
        console.log(`New demo booked: ${invitee.email} - ${invitee.name}`);
      }
    }

    if (event === 'invitee.canceled') {
      const invitee = eventPayload?.invitee;
      if (invitee?.email) {
        console.log(`Demo cancelled: ${invitee.email}`);
      }
    }
  }
}
