import { atom } from 'jotai'

// Átomos de Ativação;
export const ShowMenuAtom = atom(false)

export const ShowRosapiAtom = atom(false)

export const ShowTeleopAtom = atom(false)

export const ShowMapAtom = atom(true)

export const ShowBatteryAtom = atom(true)

export const ShowAssistantAtom = atom(false)

// Átomos de Configurações;
export const DashboardAtom = atom({ main: 1, firstside: 2 })

export const TopicsAtom = atom({ first: {topic: "", which: 1}, second: {topic: "", which: 1}, third: {topic: "", which: 1}, fourth: {topic: "", which: 1}, fifth: {topic: "", which: 1}, sixth: {topic: "", which: 1}, seventh: {topic: "", which: 1}, eighth: {topic: "", which: 1}, ninth: {topic: "", which: 1} })

export const SectionsAtom = atom(1)

export const ThemeAtom = atom('light')

export const BatteryAtom = atom(false) // Átomo para lógica da informação da bateria

// Átomos de Variáveis;
export const SpeedLimitAtom = atom({ linear: 1, angular: 1 })

//Átomos de Log Message : Use "useSetAtom" para apenas modificar o valor mas não causar renderização extra
export const LogAtom = atom( { msg: '', id: 0, error: false } ) 