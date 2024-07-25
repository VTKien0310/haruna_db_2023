import {useToast} from 'vuestic-ui';
import type {SupabaseClient, User} from '@supabase/supabase-js';
import dayjs from 'dayjs';
import type {Media} from '@/modules/gallery/GalleryEntities';

export class GalleryStatisticService {
  private readonly toastInit = useToast().init;

  constructor(private readonly supabasePort: SupabaseClient) {}

  async countTotalMedias(): Promise<number> {
    const {count, error} = await this.supabasePort.
        from('medias').
        select('*', {
          count: 'exact',
          head: true,
        });

    if (error || count === null) {
      this.toastInit({
        message: 'Failed to count total medias',
        color: 'danger',
      });

      return 0;
    }

    return count;
  }

  async countUserUploadedMedias(user: User): Promise<number> {
    const {count, error} = await this.supabasePort.
        from('medias').
        select('*', {
          count: 'exact',
          head: true,
        }).
        eq('uploader_id', user.id);

    if (error || count === null) {
      this.toastInit({
        message: 'Failed to count user\'s uploaded medias',
        color: 'danger',
      });

      return 0;
    }

    return count;
  }

  async countUploadedMediasWithinPassDays(days: number): Promise<number> {
    const targetPointInTime: string = dayjs().
        subtract(days, 'day').
        utc().
        toISOString();

    const {count, error} = await this.supabasePort.
        from('medias').
        select('*', {
          count: 'exact',
          head: true,
        }).
        filter('created_at', 'gte', targetPointInTime);

    if (error || count === null) {
      this.toastInit({
        message: 'Failed to count newly uploaded medias',
        color: 'danger',
      });

      return 0;
    }

    return count;
  }

  async getLatestUploadMedia(): Promise<Media | null> {
    const {data, error} = await this.supabasePort.
        from('medias').
        select().
        limit(1).
        order('created_at', {ascending: false});

    if (error || data === null || data.length === 0) {
      return null;
    }

    return data[0];
  }
}
