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

type RobotData = typeof defaultrobotData

interface ROSProps {
  isConnected: boolean
  setisConnected: ( newState: boolean ) => void

  ros: ROS2Service
  rosapiData: Record<string, string | string[] | number | boolean>
  setrosapiData: ( newState: Record<string, string | string[] | number | boolean>, ) => void
  batteryData: typeof defaultbatteryConfig
  setbatteryData: ( newconfig: typeof defaultbatteryConfig ) => void

  robots: Record<string, RobotData>
  currentrobot: string
  setcurrentRobot: (id: string) => void
  robotData: typeof defaultrobotData
  setrobotData: ( newData: typeof defaultrobotData ) => void

  addrobot: (id: string) => void
  updaterobots: ( newData: typeof defaultrobotData, id: string ) => void
  removerobot: (id: string) => void
  
  computeTopics: () => void
  ConvertTopic: ( topic: string ) => string
}

export const ROStore = create<ROSProps>()((set, get) => ({
  isConnected: false,
  setisConnected: ( newState: boolean ) => set({ isConnected: newState }),

  ros: new ROS2Service(),
  rosapiData: {} as Record<string, string | string[] | number | boolean>,
  setrosapiData: ( newState: Record<string, string | string[] | number | boolean>) => set({ rosapiData: newState }),
  batteryData: defaultbatteryConfig,
  setbatteryData: ( newconfig ) => set({ batteryData: newconfig }),

  robots: { default: { ...defaultrobotData } },
  currentrobot: "default",
  setcurrentRobot: ( id ) => set({ currentrobot: id }),
  robotData: defaultrobotData,
  setrobotData: ( newData ) => set({ robotData: newData }),

  addrobot: (id) => set((s) => ({ robots: { ...s.robots, [id]: { ...defaultrobotData } } })),
  removerobot: (id) => { const rest = { ...get().robots }; delete rest[id]; set({ robots: rest }) },
  updaterobots: ( newData, id ) => { const robots = { ...get().robots }; set({ ...robots, [id]: newData }) },

  

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

  ConvertTopic: (topic) => {
    const hostIP = get().ros.hostIP
    const camUrl = window.location.protocol === 'https:' ? `https://${window.location.host}/stream?topic=${topic}&type=mjpeg` : `http://${hostIP}:8080/stream?topic=${topic}&type=mjpeg`;
    // first: `${camUrl}/stream?topic=${topic}&type=mjpeg`
    return camUrl;
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