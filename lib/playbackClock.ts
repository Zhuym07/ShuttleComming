export interface ClockSnapshot {
  mode: 'real' | 'simulated';
  date: Date;
  seconds: number;
  playing: boolean;
  speed: number;
  revision: number;
}
type FrameListener = (seconds: number, timestamp: number) => void;
const localSeconds = (date: Date) => date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() / 1000;

export function createPlaybackClock() {
  let snapshot: ClockSnapshot = { mode: 'real', date: new Date(), seconds: localSeconds(new Date()), playing: true, speed: 10, revision: 0 };
  let anchor = snapshot.seconds;
  let anchorTime = performance.now();
  let hidden = document.hidden;
  let boundaries: number[] = [];
  let lastPublished = 0;
  const listeners = new Set<() => void>();
  const frames = new Set<FrameListener>();
  const read = (timestamp = performance.now()) => snapshot.mode === 'real'
    ? localSeconds(new Date())
    : Math.min(86399.999, anchor + (snapshot.playing && !hidden ? (timestamp - anchorTime) * snapshot.speed / 1000 : 0));
  const publish = (seconds: number) => {
    snapshot = { ...snapshot, seconds, date: snapshot.mode === 'real' ? new Date() : snapshot.date };
    listeners.forEach(listener => listener());
    lastPublished = performance.now();
  };
  const emit = (timestamp: number) => frames.forEach(listener => listener(read(timestamp), timestamp));
  const update = (change: Partial<ClockSnapshot>, jump = false) => {
    anchor = change.seconds ?? read();
    anchorTime = performance.now();
    snapshot = { ...snapshot, ...change, seconds: anchor, revision: snapshot.revision + (jump ? 1 : 0) };
    publish(anchor);
    emit(anchorTime);
  };
  return {
    read,
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    onFrame: (listener: FrameListener) => { frames.add(listener); return () => { frames.delete(listener); }; },
    setBoundaries: (values: number[]) => { boundaries = [...new Set(values)].sort((a, b) => a - b); },
    seek: (seconds: number, date = snapshot.date, playing = snapshot.playing) => update({ mode: 'simulated', date, seconds: Math.max(0, Math.min(86399.999, seconds)), playing }, true),
    setPlaying: (playing: boolean) => update({ playing }),
    setSpeed: (speed: number) => update({ speed }),
    reset: () => update({ mode: 'real', date: new Date(), seconds: localSeconds(new Date()), playing: true }, true),
    start: () => {
      let animation = 0;
      let previous = read();
      const tick = (timestamp: number) => {
        if (!hidden) {
          const seconds = read(timestamp);
          const crossed = seconds < previous || boundaries.some(boundary => previous < boundary && seconds >= boundary);
          if (crossed || (seconds !== snapshot.seconds && timestamp - lastPublished >= 1000)) publish(seconds);
          emit(timestamp);
          previous = seconds;
        }
        animation = requestAnimationFrame(tick);
      };
      const visibility = () => {
        if (document.hidden) { anchor = read(); hidden = true; }
        else { hidden = false; anchorTime = performance.now(); previous = read(); publish(previous); emit(anchorTime); }
      };
      document.addEventListener('visibilitychange', visibility);
      animation = requestAnimationFrame(tick);
      return () => { cancelAnimationFrame(animation); document.removeEventListener('visibilitychange', visibility); };
    },
  };
}
export type PlaybackClock = ReturnType<typeof createPlaybackClock>;
