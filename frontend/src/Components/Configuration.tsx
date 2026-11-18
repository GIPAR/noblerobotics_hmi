import { useState, useEffect } from 'react'
import './Configuration.css'

import { useStore } from 'zustand'
import { GlobalStore, ROStore } from '../contexts/Store'
import { useAtom, useSetAtom } from 'jotai'
import { LogAtom, ShowMenuAtom, ShowTeleopAtom, ShowRosapiAtom, ThemeAtom, ShowMapAtom, SpeedLimitAtom, ShowAssistantAtom, ShowBatteryAtom } from '../contexts/Molecule'

export const ConfigurationMenu = () => {
    const [ConfigOption, setConfigOption] = useState(1)

    const ros = useStore(ROStore, (s) => s.ros)
    const isConnected = useStore(ROStore, (s) => s.isConnected)
    const userConfig = useStore(GlobalStore, (s) => s.userConfig)
    const robotData = useStore(ROStore, (state) => state.robotData)
    const Link = useStore(ROStore, (state) => state.Link)
    const logout = useStore(GlobalStore, (state) => state.logout)
    const setrobotData = useStore(ROStore, (state) => state.setrobotData)
    const setLink = useStore(ROStore, (state) => state.setLink)
    const compute = useStore(ROStore, (state) => state.computeTopics)
    const computeLinks = useStore(ROStore, (state) => state.computeLinks)
    const [ShowMenu, setShowMenu]= useAtom(ShowMenuAtom)
    const [ShowRosapi, setShowRosapi] = useAtom(ShowRosapiAtom)
    const [StartTeleop, setStartTeleop] = useAtom(ShowTeleopAtom)
    const [Theme, setTheme] = useAtom(ThemeAtom)
    const [ShowMap, setShowMap] = useAtom(ShowMapAtom)
    const [ShowAssistant, setShowAssistant] = useAtom(ShowAssistantAtom)
    const [MaxSpeed, setMaxSpeed] = useAtom(SpeedLimitAtom)
    const [ShowBattery, setShowBattery] = useAtom(ShowBatteryAtom)
    const setLogData = useSetAtom(LogAtom)

    useEffect(() => {
        if(isConnected === false){
            setShowRosapi(false);
        }
    }, [isConnected, setShowRosapi]);

    return (
        <div className='Configuration'>
          <div className={`configuration-button ${ShowMenu ? 'enabled' : 'disabled'}`} onClick={() => setShowMenu(!ShowMenu)}>{"<"}</div>

          <div className={`configuration-panel ${ShowMenu ? 'show' : 'hide'} ${Theme === 'light' ? 'light' : 'dark'}`}>

            <div className='configuration-options'>
              <div className='configuration-options-button' onClick={() => setConfigOption(1)}>Principal</div>
              <div className='configuration-options-button' onClick={() => setConfigOption(2)}>Ferramentas</div>
              <div className='configuration-options-button' onClick={() => setConfigOption(3)}>Aparência</div>
              <div className='configuration-options-button' onClick={() => setConfigOption(4)}>Avançado</div>
            </div>

            {ConfigOption === 1 ?
            <>
            <div className='configuration-header'>
              <h1>Opções de Conexão</h1>
            </div>

            <div className='configuration-box'>
              <div className={`configuration-box-button ${isConnected ? 'active' : ''} `} onClick={() => ros.connect()}> </div>
              <div className='configuration-box-text'> {isConnected ? 'Conectado ao ROS2!' : 'Conectar-se ao ROS2'} </div>
            </div>

            <div className='configuration-box'>
              <div className='configuration-box-button' onClick={ros.disconnect}> </div>
              <div className='configuration-box-text'> Desconectar </div>
            </div>

            <div className='configuration-box'>
              <div className='configuration-box-button' onClick={() => { 
                logout(); setShowMenu(false); setShowRosapi(false); setLogData({msg: "Retornado a tela Inicial", id: Date.now(), error: false}); }}> </div>
              <div className='configuration-box-text'> Deslogar </div>
            </div>

            <div className='configuration-header'>
              <h1>Opções do Robô</h1>
            </div>

            <div className='configuration-box'>
              <div className={`configuration-box-button ${StartTeleop ? 'active' : ''} `} onClick={() => {if(isConnected == false){setLogData({msg: "Primeiramente conecte ao ROS!", id: Date.now(), error: true});} else{setStartTeleop(!StartTeleop)}}}> </div>
              <div className='configuration-box-text'> {StartTeleop ? 'Desativar Teclado' : 'Ativar Teclado'} </div>
            </div>

            <div className='configuration-box'>
              <div className='configuration-box-button' onClick={ros.stopRobot}> </div>
              <div className='configuration-box-text'> Parar Robô </div>
            </div>
            </>
            : null}



            {ConfigOption === 2 ?
            <>
            <div className='configuration-header'>
              <h1>Ferramentas Gerais</h1>
            </div>

            <div className='configuration-box'>
              <div className={`configuration-box-button ${ShowAssistant ? 'active' : ''}`} onClick={() => setShowAssistant(!ShowAssistant)}> </div>
              <div className='configuration-box-text'> {ShowAssistant ? 'Desativar Assistente' : 'Ativar Assistente'} </div>
            </div>

            <div className='configuration-box'>
              <div className={`configuration-box-button ${ShowBattery ? 'active' : ''}`} onClick={() => setShowBattery(!ShowBattery)}> </div>
              <div className='configuration-box-text'> {ShowBattery ? 'Esconder Visualização da Carga' : 'Visualização da Carga'} </div>
            </div>

            <div className='configuration-header'>
              <h1>Ferramentas do ROS2</h1>
            </div>

            {userConfig.isAdmin === true ? 
            <>
            <div className='configuration-box'>
              <div className={`configuration-box-button ${ShowMap ? 'active' : ''} `} onClick={() => {if(isConnected == false && ShowMap == false){setLogData({msg: "Primeiramente conecte ao ROS!", id: Date.now(), error: true});} else{setShowMap(!ShowMap)}}}> </div>
              <div className='configuration-box-text'> {ShowMap ? 'Desativar Mapa SLAM' : 'Ativar Mapa Slam'} </div>
            </div>

            <div className='configuration-box'>
              <div className={`configuration-box-button ${ShowRosapi ? 'active' : ''} `} onClick={() => {if(isConnected == false){setLogData({msg: "Primeiramente conecte ao ROS!", id: Date.now(), error: true});} else{setShowRosapi(!ShowRosapi)}}}> </div>
              <div className='configuration-box-text'> {ShowRosapi ? 'Desativar Menu ROS' : 'Ativar Menu ROS'} </div>
            </div>
            </>
            : null}

            </>
            : null}


            {ConfigOption === 3 ?
            <>
            <div className='configuration-header'>
              <h1>Opções de Customização</h1>
            </div>

            <div className='configuration-box'>
              <div className={`configuration-box-button ${Theme === 'light' ? 'active' : ''} `} onClick={() => { if(Theme === 'light'){ setTheme('dark') } else{ setTheme('light') }}}> </div>
              <div className='configuration-box-text'> {Theme === 'light' ? 'Ativar Tema Escuro' : 'Ativar Tema Claro'} </div>
            </div>
            </>
            : null}


            {ConfigOption === 4 && userConfig.isAdmin === true ?
            <>
            <div className='configuration-header'>
              <h1>Opções de Projeto</h1>
            </div>

            <div className='configuration-box'>
              <div className='configuration-box-button' onClick={() => { setrobotData({ ...robotData, project: 'noblenara', prefix: 'alfa' }); compute(); computeLinks(); setLogData({msg: "'noblenara' selecionado!", id: Date.now(), error: false});} }> </div>
              <div className='configuration-box-text'> noblenara </div>
            </div>

            <div className='configuration-box'>
              <div className='configuration-box-button' onClick={() => { setrobotData({ ...robotData, project: 'noblecamaro', prefix: '' }); compute(); computeLinks(); setLogData({msg: "'noblecamaro' selecionado!", id: Date.now(), error: false});} }> </div>
              <div className='configuration-box-text'> noblecamaro </div>
            </div>

            <div className='configuration-box'>
              <div className='configuration-box-button' onClick={ () => { setrobotData({ ...robotData, project: 'RoboticsLLM', prefix: 'narinha' }); compute(); computeLinks(); setLogData({msg: "'RoboticsLLm' Selecionado!", id: Date.now(), error: false});} }> </div>
              <div className='configuration-box-text'> roboticsLLM </div>
            </div>

            {/* <div className='configuration-box'>
              <div className='configuration-box-button' onClick={() => { setrobotData({ ...robotData, project: 'RoboticsLLM', prefix: 'gipzinho' }); compute(); computeLinks(); setLogData({msg: "'GIPZINHO' selecionado!", id: Date.now(), error: false}); }}> </div>
              <div className='configuration-box-text'> GIPZINHO </div>
            </div> */}

            <div className='configuration-header'>
              <h1>Configurações do Robô</h1>
            </div>

            <div className='configuration-header borderless'>
              <h2>Projeto</h2>
            </div>

            <div className='configuration-box input'>
              <input type="text" placeholder="Namespace do Robô" value={robotData.project}
                onChange={(e) => {
                    setrobotData({ ...robotData, project: e.target.value })
                    compute();
                    computeLinks();
                }
                }
                className="configuration-box-input"
              />
            </div>

            <div className='configuration-header borderless'>
              <h2>Prefixo</h2>
            </div>

            <div className='configuration-box input'>
              <input type="text" placeholder="Namespace do Robô" value={robotData.prefix}
                onChange={(e) => {
                    setrobotData({ ...robotData, prefix: e.target.value })
                    compute();
                    computeLinks();
                }
                }
                className="configuration-box-input"
              />
            </div>

            <div className='configuration-header borderless'>
              <h2>Tópicos</h2>
            </div>

            <div className='configuration-box input'>
              <input type="text" placeholder="Tópico do cmd_vel" value={robotData.topic_cmd_vel}
                onChange={(e) => setrobotData({ ...robotData, topic_cmd_vel: e.target.value })}
                className="configuration-box-input"
              />
            </div>

            <div className='configuration-box input'>
              <input type="text" placeholder="Tópico da Câmera Link" value={robotData.topic_camera_link}
                onChange={(e) => setrobotData({ ...robotData, topic_camera_link: e.target.value })}
                className="configuration-box-input"
              />
            </div>

            <div className='configuration-box input'>
              <input type="text" placeholder="Tópico da Câmera User" value={robotData.topic_camera_user}
                onChange={(e) => setrobotData({ ...robotData, topic_camera_user: e.target.value })}
                className="configuration-box-input"
              />
            </div>

            <div className='configuration-box input'>
              <input type="text" placeholder="Tópico da Bateria" value={ robotData.topic_battery }
                onChange={(e) => setrobotData({ ...robotData, topic_battery: e.target.value })}
                className="configuration-box-input"
              />
            </div>

            <div className='configuration-box input'>
              <input type="text" placeholder="Tópico do Mapa SLAM" value={ robotData.topic_map }
                onChange={(e) => setrobotData({ ...robotData, topic_map: e.target.value })}
                className="configuration-box-input"
              />
            </div>

            <div className='configuration-box input'>
              <input type="text" placeholder="Tópico da Posição" value={ robotData.topic_pose }
                onChange={(e) => setrobotData({ ...robotData, topic_pose: e.target.value })}
                className="configuration-box-input"
              />
            </div>

            <div className='configuration-box input'>
              <input type="text" placeholder="Tópico do Comando de Nav2" value={ robotData.topic_goal_pose }
                onChange={(e) => setrobotData({ ...robotData, topic_goal_pose: e.target.value })}
                className="configuration-box-input"
              />
            </div>

            <div className='configuration-header borderless'>
              <h2>Endereço das Câmeras</h2>
            </div>

            <div className='configuration-box input'>
              <input type="text" placeholder="Endereço da Câmera Link" value={ Link.link }
                onChange={(e) => setLink({ ...Link, link: e.target.value })}
                className="configuration-box-input"
              />
            </div>

            <div className='configuration-box input'>
              <input type="text" placeholder="Endereço da Câmera User" value={ Link.user }
                onChange={(e) => setLink({ ...Link, user: e.target.value })}
                className="configuration-box-input"
              />
            </div>

            <div className='configuration-header borderless'>
              <h2>Frames</h2>
            </div>

            <div className='configuration-box input'>
              <input type="text" placeholder="Frame do Mapa" value={ robotData.frame_map }
                onChange={(e) => setrobotData({ ...robotData, frame_map: e.target.value })}
                className="configuration-box-input"
              />
            </div>
            </>
            : null}

          </div>
        </div>
    );
}