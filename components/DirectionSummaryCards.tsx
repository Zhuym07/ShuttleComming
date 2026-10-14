import { Direction, DirectionSummary } from '../types';
import { Language, translate, TranslationKey } from '../locales';
import { getDepartureCountdown } from '../lib/shuttle';

interface Props {
  summaries: DirectionSummary[];
  selectedDirection: Direction;
  currentTimeMinutes: number;
  isToday: boolean;
  lang: Language;
  onSelectDirection: (direction: Direction) => void;
  layout?: 'top' | 'dock';
}

export default function DirectionSummaryCards({ summaries, selectedDirection, currentTimeMinutes, isToday, lang, onSelectDirection, layout = 'top' }: Props) {
  return <div className={'campus-switcher campus-switcher-'+layout}>{summaries.map(summary => {
    const south = summary.direction === Direction.SOUTH_TO_NORTH;
    const [next, ...later] = summary.upcomingDepartures;
    const countdown = next && isToday ? getDepartureCountdown(next.departureTime, currentTimeMinutes) : undefined;
    const countdownText = countdown ? translate(lang, countdown.unit === 'seconds' ? 'departure_seconds' : 'departure_minutes', { count: countdown.value }) : translate(lang, 'future_date_schedule');
    const shortCountdown = countdown ? translate(lang, countdown.unit === 'seconds' ? 'departure_seconds_short' : 'departure_minutes_short', { count: countdown.value }) : '';
    const heading = translate(lang, south ? 'campus_south' : 'campus_north');
    const origin = next ? translate(lang, ('departure_' + next.origin.id) as TranslationKey) : '';
    const ended = translate(lang, isToday ? 'departure_none' : 'departure_none_date');
    return <button key={summary.routeId} className={'departure-card' + (south ? '' : ' north-card') + (countdown?.urgent ? ' departure-urgent' : '')}
      aria-pressed={summary.direction === selectedDirection}
      aria-label={[heading, translate(lang, isToday ? 'departure_next' : 'departure_first'), next?.departureTime ?? ended, next && next.runs.length > 1 ? translate(lang,'departure_count',{count:next.runs.length}) : '', next ? countdownText : '', origin, later.length ? translate(lang,'departure_later')+' '+later.map(group=>group.departureTime).join('、') : ''].filter(Boolean).join('，')}
      onClick={() => onSelectDirection(summary.direction)}>
      <div className='departure-header'>
        <span className='departure-campus'>{heading}<em>{translate(lang, south ? 'destination_north' : 'destination_south')}</em></span>
        {next && <span className='departure-origin'>
          <span className='origin-full'>{origin}</span>
          <span className='origin-short'>{translate(lang, ('departure_short_'+next.origin.id) as TranslationKey)}</span>
        </span>}
      </div>
      {next ? <>
        <div className='departure-main'>
          <div className='departure-primary'>
            {!isToday && <span className='departure-caption'>{translate(lang, 'departure_first')}</span>}
            <div className='departure-time'><strong>{next.departureTime}</strong></div>
            {next.runs.length > 1 && <span className='departure-badges'><small>{translate(lang, 'departure_count_short', { count: next.runs.length })}</small></span>}
          </div>
          <div className='departure-status'>
            {isToday && <div className='departure-countdown'>
              <span className='countdown-full'>{countdownText}</span>
              <span className='countdown-short'>{shortCountdown}</span>
            </div>}
            {next.runs.some(run => run.tag === 'red') && <i className='red-tag'>R</i>}
          </div>
        </div>
        <div className='departure-later'><span>{translate(lang, later.length ? 'departure_later' : 'departure_last')}</span>{later.map(group => <span key={group.departureTime}><time>{group.departureTime}</time>{group.runs.length > 1 && <small title={translate(lang,'departure_count',{count:group.runs.length})}>{translate(lang, 'departure_count_short', { count: group.runs.length })}</small>}{group.runs.some(run => run.tag === 'red') && <i className='red-tag'>R</i>}</span>)}</div>
      </> : <p className='departure-ended'><span className='ended-full'>{ended}</span><span className='ended-short'>{translate(lang,'departure_none_short')}</span></p>}
    </button>;
  })}</div>;
}
