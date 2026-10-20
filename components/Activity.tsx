import { getCalendar } from '@/lib/github';
import Heatmap from './Heatmap';

export default async function Activity() {
  const cal = await getCalendar();
  return <Heatmap days={cal.days} total={cal.total} live={cal.source === 'live'} />;
}
