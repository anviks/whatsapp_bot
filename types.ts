export interface HopitudeTimetable {
  events: HopitudeEvent[];
  mobile_events: HopitudeMobileEvent[];
  start: number;
  end: number;
  disable_timeline: boolean;
  cal_hide_time: boolean;
}

interface HopitudeEvent {
  id: number;
  wo_id: number;
  title: string;
  invite_status: number;
  end: number;
  start: number;
  duration: number;
  start_time: string;
  start_date_en: string;
  start_date: string;
  start_date_mobile: string;
  status: number;
  week_day: number;
  start_hour: number;
  start_minute: number;
  end_hour: number;
  month_slot: number;
  month_day: number;
  start_weekday: number;
  style: HopitudeEventStyle;
  coach_id: number;
  room_id: number;
  show_seats: boolean;
  calendar_slot: string;
  room: string;
  end_time: string;
  free_seats: number;
  total_seats: number;
}

interface HopitudeMobileEvent {
  events: HopitudeEvent[];
  week_day: string;
  date: string;
  day: number;
}

interface HopitudeEventStyle {
  backgroundColor: string;
  color: string;
  border: string;
  borderLeft: string;
}

export type VoteHistory = Map<string, { name: string, selection: string[] }>
