import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPlaybackClock } from '../lib/playbackClock';

export function usePlaybackClock() {
  const [clock] = useState(createPlaybackClock);
  const snapshot = useSyncExternalStore(clock.subscribe, clock.getSnapshot);
  useEffect(() => clock.start(), [clock]);
  return { clock, snapshot };
}
