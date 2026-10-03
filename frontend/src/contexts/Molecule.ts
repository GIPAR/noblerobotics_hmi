import { atom } from 'jotai'

// Átomos de Ativação;
export const ShowMenuAtom = atom(false)

export const ShowRosapiAtom = atom(false)

export const ShowTeleopAtom = atom(false)

export const ShowMapAtom = atom(true)

export const ShowBatteryAtom = atom(true)

export const ShowAssistantAtom = atom(true)

// Átomos de Configurações;
export const DashboardAtom = atom({ main: 1, firstside: 2 })

export const ThemeAtom = atom('light')

export const BatteryAtom = atom(false) // Átomo para lógica da informação da bateria

// Átomos de Variáveis;
export const SpeedLimitAtom = atom({ linear: 1, angular: 1 })

//Átomos de Log Message : Use "useSetAtom" para apenas modificar o valor mas não causar renderização extra
export const LogAtom = atom( { msg: '', id: 0, error: false } ) 

// Átomo de controle de voz: só fica true quando o usuário logado é do tipo 'usuario_def'
export const VozAtivaAtom = atom<boolean>(false)
 