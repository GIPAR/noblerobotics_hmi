import Chat from "./Components/Chat";
import { useEffect, useRef } from 'react'
import { Intro } from './Components/Intro';
import { ConfigurationMenu } from './Components/Configuration';
import { MessageLog } from './Components/MessageLog';
import { Dashboard } from './Components/Dashboard/Dashboard';
import './App.css';

import { useStore } from 'zustand'
import { GlobalStore, ROStore } from './contexts/Store'
import { useAtom } from 'jotai';
import { ThemeAtom, ShowAssistantAtom } from './contexts/Molecule';

function App() {
  const connectionAttemptedRef = useRef(false);
  const userConfig = useStore(GlobalStore, (s) => s.userConfig)
  const isConnected = useStore(ROStore, (s) => s.isConnected)
  const ros = useStore(ROStore, (s) => s.ros)
  const [Theme] = useAtom(ThemeAtom)
  const [ShowAssistant] = useAtom(ShowAssistantAtom)

  useEffect(() => {
    if (!connectionAttemptedRef.current) {
      connectionAttemptedRef.current = true;
      ros.connect();
    }
    return () => {
      connectionAttemptedRef.current = true;
  
      if (isConnected) {
        ros.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

// setCameraURL({link: 'http://localhost:8080/stream?topic=/zed/zed_node/rgb/color/rect/image&type=mjpeg', user: 'http://localhost:8080/stream?topic=/noblenara/camera_usuario&type=mjpeg'});

  if(userConfig.Intro === true){ //Renderiza a Introdução
    return <Intro />;
  }

  return (
    <div className={`App ${Theme}`}>
      <main>
        <MessageLog/>

        {ShowAssistant ? <Chat /> : null}

        <div className='App-header'> <h1>
          noblerobotics_hmi
        </h1></div>

        <ConfigurationMenu/>

        <Dashboard/>
      </main>
    </div>
  )
}

export default App