import { atom } from 'jotai'
import { today } from '@/lib/date'

export const selectedDateAtom = atom(today())
