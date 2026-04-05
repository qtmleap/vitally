import dayjs from 'dayjs'

export function today() {
  return dayjs().format('YYYY-MM-DD')
}

export function formatDate(date: string) {
  return dayjs(date).format('YYYY/MM/DD')
}

export function addDays(date: string, days: number) {
  return dayjs(date).add(days, 'day').format('YYYY-MM-DD')
}
