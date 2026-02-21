import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class StitchService {
  private readonly logger = new Logger(StitchService.name);
  private readonly baseUrl = 'https://stitch.googleapis.com/v1';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async generateUIFromText(prompt: string) {
    const projectId =
      this.configService.get<string>('GCP_PROJECT_ID') || 'vibeclonepro';
    const accessToken = this.configService.get<string>('GCP_ACCESS_TOKEN');

    if (!accessToken) {
      this.logger.error('No GCP_ACCESS_TOKEN found in environment');
      throw new Error('Stitch authentication failed: Missing Access Token');
    }

    this.logger.log(`Invoking Stitch UI generation for project: ${projectId}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/projects/${projectId}/screens:generateFromText`,
          { prompt },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'X-Goog-User-Project': projectId,
            },
          },
        ),
      );

      return response.data as Record<string, unknown>;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: { message?: string } } };
        message?: string;
      };
      this.logger.error(
        `Stitch API error: ${err.response?.data?.error?.message ?? err.message ?? 'Unknown error'}`,
      );
      throw error;
    }
  }

  async getScreen(screenId: string): Promise<any> {
    const projectId =
      this.configService.get<string>('GCP_PROJECT_ID') || 'vibeclonepro';
    const accessToken = this.configService.get<string>('GCP_ACCESS_TOKEN');

    const response = await firstValueFrom(
      this.httpService.get(
        `${this.baseUrl}/projects/${projectId}/screens/${screenId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Goog-User-Project': projectId,
          },
        },
      ),
    );

    return response.data;
  }
}
