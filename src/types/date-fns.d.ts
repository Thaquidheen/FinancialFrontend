declare module 'date-fns' {
  export function format(date: Date, formatStr: string): string;
  export function formatDistance(date: Date, baseDate: Date, options?: { addSuffix?: boolean }): string;
  export function parseISO(dateString: string): Date;
}
