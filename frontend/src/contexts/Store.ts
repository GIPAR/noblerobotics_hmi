import { create } from 'zustand'
import { ROS2Service } from '../services/ROS2Service'

const defaultuserConfig = { Login: false, isAdmin: false, Intro: true }
const nullUser = { name: '', password: '' }

// Loja 1/2 => Loja Geral
interface GlobalState {
  User: typeof nullUser
  setUser: (newuser: typeof nullUser) => void

  userConfig: typeof defaultuserConfig
  setuserConfig: (newconfig: typeof defaultuserConfig ) => void
  logout: () => void
}

export const GlobalStore = create<GlobalState>()((set) => ({
  User: nullUser,
  setUser: ( newuser: typeof nullUser ) => set({ User: newuser }),

  userConfig: defaultuserConfig,
  setuserConfig: ( newconfig ) => set({ userConfig: newconfig }),
  logout: () => set({ userConfig: defaultuserConfig, User: nullUser }),
}))



// Loja 2/2 => Loja ROS
const defaultbatteryConfig = { voltage: 0, percentage: 0, status: 'Desconhecida' }
const defaultrobotData = {
  project: 'noblenara',
  prefix: '',

  topic_cmd_vel: '/noblenara/cmd_vel',
  topic_camera_link: '/noblenara/camera_link/image',
  topic_camera_user: '/noblenara/camera_user',
  topic_map: '/noblenara/map',
  topic_pose: '/noblenara/pose',
  topic_goal_pose: '/noblenara/goal_pose',
  topic_battery: '/noblenara/battery_status',

  frame_map: 'noblenara/map'
}
const defaultLink = {
  link: 'http://localhost:8080/stream?topic=/noblenara/camera_link/image&type=mjpeg',
  user: 'http://localhost:8080/stream?topic=/noblenara/camera_user&type=mjpeg'
}

interface ROSProps {
  isConnected: boolean
  setisConnected: ( newState: boolean ) => void

  ros: ROS2Service
  rosapiData: Record<string, string | string[] | number | boolean>
  setrosapiData: ( newState: Record<string, string | string[] | number | boolean>, ) => void
  batteryData: typeof defaultbatteryConfig
  setbatteryData: ( newconfig: typeof defaultbatteryConfig ) => void
  robotData: typeof defaultrobotData
  setrobotData: ( newData: typeof defaultrobotData ) => void

  Link: typeof defaultLink
  setLink: ( newLink: typeof defaultLink ) => void
  
  computeTopics: () => void
  computeLinks: () => void
}

export const ROStore = create<ROSProps>()((set, get) => ({
  isConnected: false,
  setisConnected: ( newState: boolean ) => set({ isConnected: newState }),

  ros: new ROS2Service(),
  rosapiData: {} as Record<string, string | string[] | number | boolean>,
  setrosapiData: ( newState: Record<string, string | string[] | number | boolean>) => set({ rosapiData: newState }),
  batteryData: defaultbatteryConfig,

  setbatteryData: ( newconfig ) => set({ batteryData: newconfig }),
  robotData: defaultrobotData,
  setrobotData: ( newData ) => set({ robotData: newData }),

  Link: defaultLink,
  setLink: ( newLink ) => set({ Link: newLink }),

  computeTopics: () => {
    const { robotData } = get()

    if( robotData.prefix.startsWith('/') || robotData.prefix === '' ){
      set({ robotData: { ...robotData,
        topic_cmd_vel: `/${robotData.project}${robotData.prefix}/cmd_vel`, 
        topic_camera_link: `/${robotData.project}${robotData.prefix}/camera_link/image`,
        topic_camera_user: `/${robotData.project}${robotData.prefix}/camera_user`,
        topic_map: `/${robotData.project}${robotData.prefix}/map`,
        topic_pose: `/${robotData.project}${robotData.prefix}/pose`,
        topic_goal_pose: `/${robotData.project}${robotData.prefix}/goal_pose`,
        topic_battery: `/${robotData.project}${robotData.prefix}/battery_status`,

        frame_map: `${robotData.project}${robotData.prefix}/map`,
      } })
    }
    else{
      set({ robotData: { ...robotData,
        topic_cmd_vel: `/${robotData.project}/${robotData.prefix}/cmd_vel`,
        topic_camera_link: `/${robotData.project}/${robotData.prefix}/camera_link/image`,
        topic_camera_user: `/${robotData.project}/${robotData.prefix}/camera_user`,
        topic_map: `/${robotData.project}/${robotData.prefix}/map`,
        topic_pose: `/${robotData.project}/${robotData.prefix}/pose`,
        topic_goal_pose: `/${robotData.project}/${robotData.prefix}/goal_pose`,
        topic_battery: `/${robotData.project}/${robotData.prefix}/battery_status`,

        frame_map: `${robotData.project}/${robotData.prefix}/map`,
      } })
    }
  },

  computeLinks: () => {
    const { robotData } = get()
    const hostIP = get().ros.hostIP

    set({ Link: {
      link: `http://${hostIP}:8080/stream?topic=${robotData.topic_camera_link}&type=mjpeg`,
      user: `http://${hostIP}:8080/stream?topic=${robotData.topic_camera_user}&type=mjpeg`
    } })
  },
}))



// Loja 3/3 => Loja chatBot

interface Message {
  role: "user" | "assistant";
  content: string;
}

const defaultHistory: Message[] = [];

interface ChatProps {
  History: typeof defaultHistory;
  setHistory: ( role: "user" | "assistant", content: string ) => void
}

export const ChatStore = create<ChatProps>((set, get) => ({
  History: defaultHistory,

  setHistory: ( role: "user" | "assistant", content: string ) => {
    const History = get().History;

    set({
      History: [...History, { role: role, content: content }],
    });
  },
}));