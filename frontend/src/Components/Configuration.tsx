import { useState, useEffect } from 'react'
import './Configuration.css'

import { useStore } from 'zustand'
import { GlobalStore, ROStore } from '../contexts/Store'
import { useAtom, useSetAtom } from 'jotai'
import { LogAtom, ShowMenuAtom, ShowTeleopAtom, ShowRosapiAtom, ThemeAtom, ShowMapAtom, ShowAssistantAtom, ShowBatteryAtom, SectionsAtom, currentSectionAtom, RobotsAtom } from '../contexts/Molecule'

export const ConfigurationMenu = () => {
    const [ConfigOption, setConfigOption] = useState(1)

    const ros = useStore(ROStore, (s) => s.ros)
    const isConnected = useStore(ROStore, (s) => s.isConnected)
    const userConfig = useStore(GlobalStore, (s) => s.userConfig)
    const logout = useStore(GlobalStore, (state) => state.logout)
    const compute = useStore(ROStore, (state) => state.computeTopics)
    const [ShowMenu, setShowMenu]= useAtom(ShowMenuAtom)
    
    const [ShowRosapi, setShowRosapi] = useAtom(ShowRosapiAtom)
    const [StartTeleop, setStartTeleop] = useAtom(ShowTeleopAtom)
    const [Theme, setTheme] = useAtom(ThemeAtom)
    const [ShowMap, setShowMap] = useAtom(ShowMapAtom)
    const [ShowAssistant, setShowAssistant] = useAtom(ShowAssistantAtom)
    const [ShowBattery, setShowBattery] = useAtom(ShowBatteryAtom)
    const setSections = useSetAtom(SectionsAtom)
    const setLogData = useSetAtom(LogAtom)

    const [sRobot, setRobots] = useAtom(RobotsAtom)
    const [currentSection] = useAtom(currentSectionAtom)
    
    const robots = useStore(ROStore, (state) => state.robots)
    const currentRobot = useStore(ROStore, (state) => state.currentrobot)
    const setcurrentRobot = useStore(ROStore, (state) => state.setcurrentRobot)
    const addrobot = useStore(ROStore, (state) => state.addrobot)
    const updaterobots = useStore(ROStore, (state) => state.updaterobots)
    const removerobot = useStore(ROStore, (state) => state.removerobot)
    const setrobotData = useStore(ROStore, (state) => state.setrobotData)
    
    setrobotData( robots[currentRobot] );
    
    const robotData = useStore(ROStore, (state) => state.robotData)
    const [AltSections, setAltSections] = useState<string>("")
    const [AltnewRobot, setAltnewRobot] = useState<string>("")

    

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
              <h1>Opções de Visualização</h1>
            </div>

            <div className='configuration-box'>
              <div className={`configuration-box-button ${ShowAssistant ? 'active' : ''}`} onClick={() => setShowAssistant(!ShowAssistant)}> </div>
              <div className='configuration-box-text'> {ShowAssistant ? 'Desativar Assistente' : 'Ativar Assistente'} </div>
            </div>

            <div className='configuration-box'>
              <div className={`configuration-box-button ${ShowBattery ? 'active' : ''}`} onClick={() => setShowBattery(!ShowBattery)}> </div>
              <div className='configuration-box-text'> {ShowBattery ? 'Esconder Visualização da Carga' : 'Visualização da Carga'} </div>
            </div>

            <div className='configuration-box'>
              <input className="configuration-box-select"
                type="text" inputMode="numeric"
                pattern="[0-9]*" placeholder="0"
                value={AltSections}
                onChange={(e) => {
                  setAltSections(e.target.value.replace(/\D/g, ""));
                  if(Number(e.target.value) >= 1){
                    setSections(Number(e.target.value))
                  }
                }}          
              />
              <div className='configuration-box-text'> Número de Seções </div>
            </div>

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
            
            </>
            : null}



            {ConfigOption === 2 ?
            <>
            <div className='configuration-header'>
              <h1>Configurações da Sessão</h1>
            </div>

            <div className='configuration-header borderless'>
              <h2>Sessão Selecionada: {currentSection}</h2>
            </div>

            <div className='configuration-header borderless'>
              <h2>Robô Selecionado: {currentRobot}</h2>
            </div>

            {Object.entries(robots).map(([id]) => (
              <>
                <div className='configuration-box reduced'>
                  <div className='configuration-box-list'> {id} </div>

                  <div className='configuration-box-list'>
                    <div className='configuration-box-list-icon' 
                      onClick={() => {
                        setcurrentRobot( id )
                        setLogData({msg: `Robô ${id} selecionado!`, id: Date.now(), error: false}); 
                      }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="#16afa2" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm12-88a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,128Zm-88,0a12,12,0,1,1-12-12A12,12,0,0,1,96,128Z"></path></svg>
                    </div>
                  </div>
                </div>
              </>
            ))}

            <div className='configuration-header'>
              <h1>Visualização</h1>
            </div>

            {/* <div className='configuration-box reduced'>
              <div className='configuration-box-list tools'> Câmera Principal </div>

              <div className='configuration-box-list'>
                <div className='configuration-box-list-icon' 
                  onClick={() => {
                    setRobots({ ...sRobot, [currentSection]: {robot: currentRobot, which: 1} })
                    setLogData({msg: `Câmera Principal Selecionada!`, id: Date.now(), error: false}); 
                    }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="#16afa2" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm12-88a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,128Zm-88,0a12,12,0,1,1-12-12A12,12,0,0,1,96,128Z"></path></svg>
                </div>
              </div>
            </div> */}

            <div className='configuration-box'>
              <div className={`configuration-box-button ${sRobot[currentSection as keyof typeof sRobot]?.which === 1 ? 'active' : ''} `} 
                onClick={() => {
                  setRobots({ ...sRobot, [currentSection]: {robot: currentRobot, which: 1} })
                  // setLogData({msg: `Câmera Principal Selecionada!`, id: Date.now(), error: false})
                }}>
                
              </div>
              <div className='configuration-box-text'> Câmera Principal </div>
            </div>

            <div className='configuration-box'>
              <div className={`configuration-box-button ${sRobot[currentSection as keyof typeof sRobot]?.which === 2 ? 'active' : ''} `} 
                onClick={() => {
                  setRobots({ ...sRobot, [currentSection]: {robot: currentRobot, which: 2} })
                  // setLogData({msg: `Câmera Secundária Selecionada!`, id: Date.now(), error: false})
                }}>
                
              </div>
              <div className='configuration-box-text'> Câmera Secundária </div>
            </div>

            <div className='configuration-box'>
              <div className={`configuration-box-button ${sRobot[currentSection as keyof typeof sRobot]?.which === 3 ? 'active' : ''} `} 
                onClick={() => {
                  setRobots({ ...sRobot, [currentSection]: {robot: currentRobot, which: 3} })
                  setLogData({msg: `Mapa Selecionado!`, id: Date.now(), error: false})
                }}>
                
              </div>
              <div className='configuration-box-text'> Visualização do Mapa </div>
            </div>

            <div className='configuration-box'>
              <div className={`configuration-box-button ${sRobot[currentSection as keyof typeof sRobot]?.which === 4 ? 'active' : ''} `} 
                onClick={() => {
                  setRobots({ ...sRobot, [currentSection]: {robot: currentRobot, which: 4} })
                }}>
                
              </div>
              <div className='configuration-box-text'> Ativar Menu rosapi </div>
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
              <h1>Cadastramento de Robôs</h1>
            </div>

            <div className='configuration-header borderless'>
              <h2>Robô Selecionado: {currentRobot}</h2>
            </div>

            {/* [id, data] */}
            {Object.entries(robots).map(([id]) => (
              <>
                <div className='configuration-box reduced'>
                  <div className='configuration-box-list'> {id} </div>

                  <div className='configuration-box-list'>
                    <div className='configuration-box-list-icon' 
                      onClick={() => {
                        updaterobots( robotData, currentRobot )
                        setcurrentRobot(id);
                        setLogData({msg: `Robô ${id} selecionado!`, id: Date.now(), error: false}); 
                      }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="#14cf88" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm12-88a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,128Zm-88,0a12,12,0,1,1-12-12A12,12,0,0,1,96,128Z"></path></svg>
                    </div>
                    <div className='configuration-box-list-icon' 
                      onClick={() => {
                        if(Object.keys(robots)[1] !== undefined){

                          if(currentRobot === id && Object.keys(robots)[0] !== currentRobot){ 
                            setcurrentRobot(Object.keys(robots)[0])
                          }
                          else { setcurrentRobot(Object.keys(robots)[1]) };
                          removerobot(id);
                          setLogData({msg: `Robô ${id} removido!`, id: Date.now(), error: false});

                        }
                        else { setLogData({msg: `Não é possível remover o único robô da lista!`, id: Date.now(), error: true}); }
                      }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="#14cf88" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
                    </div>
                  </div>
                </div>
              </>
            ))}

            {/* verificar a possibilidade de bgar se a gente mandar uma mesma key */}

            <div className='configuration-box reduced'>
                <input type="text" placeholder="Adicionar novo Robô" value={ AltnewRobot }
                  onChange={(e) => { setAltnewRobot( e.target.value ) }}
                  onKeyDown={(e) => { if(  e.key === "Enter" ){ if(AltnewRobot === ""){ setLogData({msg: `Não é possível adicionar um robô sem nome!`, id: Date.now(), error: true}); } else addrobot( AltnewRobot ); setAltnewRobot("") } }}
                  className="configuration-box-list input"
                />

                <div className='configuration-box-list' onClick={() => { if(AltnewRobot === ""){ setLogData({msg: `Não é possível adicionar um robô sem nome!`, id: Date.now(), error: true}); } else addrobot( AltnewRobot ); setAltnewRobot("") }}>
                  <div className='configuration-box-list-icon'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="#14cf88" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm48-88a8,8,0,0,1-8,8H136v32a8,8,0,0,1-16,0V136H88a8,8,0,0,1,0-16h32V88a8,8,0,0,1,16,0v32h32A8,8,0,0,1,176,128Z"></path></svg>
                  </div>
                </div>
            </div>

            {/* Se pa adicionar método para adicionar algum tópico adicional de câmera  */}

            <div className='configuration-header'>
              <h1>Configurações do Robô</h1>
            </div>

            <div className='configuration-box reduced'>
              <div className='configuration-box-list h2'> <h2>Projeto:</h2> </div>
              <input className="configuration-box-list input2" type="text" 
                placeholder="Namespace do Robô" value={robotData.project}
                onChange={(e) => {
                    setrobotData({ ...robotData, project: e.target.value })
                    compute();
                }}
                
              />
            </div>

            <div className='configuration-box reduced'>
              <div className='configuration-box-list h2'> <h2>Prefixo:</h2> </div>
              <input className="configuration-box-list input2" type="text" 
                placeholder="Namespace" value={robotData.prefix}
                onChange={(e) => {
                    setrobotData({ ...robotData, prefix: e.target.value })
                    compute();
                }}
                
              />
            </div>

            <div className='configuration-header borderless'>
              <h2>Tópicos</h2>
            </div>

            <div className='configuration-box topics'>
              <div className='configuration-box-list h3'> Comando de Velocidade: </div>
              <input className="configuration-box-list input3" type="text" 
                placeholder="Namespace" value={robotData.topic_cmd_vel}
                onChange={(e) => {
                    setrobotData({ ...robotData, topic_cmd_vel: e.target.value })
                }} 
              />
            </div>

            <div className='configuration-box topics'>
              <div className='configuration-box-list h3'> Câmera Principal: </div>
              <input className="configuration-box-list input3" type="text" 
                placeholder="Tópico da Câmera Link" value={robotData.topic_camera_link}
                onChange={(e) => { setrobotData({ ...robotData, topic_camera_link: e.target.value }) }}
              />
            </div>

            <div className='configuration-box topics'>
              <div className='configuration-box-list h3'> Câmera Secundária: </div>
              <input className="configuration-box-list input3" type="text" 
                placeholder="Tópico da Câmera Secundária" value={robotData.topic_camera_user}
                onChange={(e) => { setrobotData({ ...robotData, topic_camera_user: e.target.value }) }}
              />
            </div>

            <div className='configuration-box topics'>
              <div className='configuration-box-list h3'> Tópico da Bateria: </div>
              <input className="configuration-box-list input3" type="text" 
                placeholder="Tópico da Bateria" value={robotData.topic_battery}
                onChange={(e) => { setrobotData({ ...robotData, topic_battery: e.target.value }) }}
              />
            </div>

            <div className='configuration-box topics'>
              <div className='configuration-box-list h3'> Tópico do Mapa: </div>
              <input className="configuration-box-list input3" type="text" 
                placeholder="Tópico do Mapa SLAM" value={robotData.topic_map}
                onChange={(e) => { setrobotData({ ...robotData, topic_map: e.target.value }) }}
              />
            </div>

            <div className='configuration-box topics'>
              <div className='configuration-box-list h3'> Tópico da Localização: </div>
              <input className="configuration-box-list input3" type="text" 
                placeholder="Tópico da Posição" value={robotData.topic_pose}
                onChange={(e) => { setrobotData({ ...robotData, topic_pose: e.target.value }) }}
              />
            </div>

            <div className='configuration-box topics'>
              <div className='configuration-box-list h3'> Navegação Autônoma: </div>
              <input className="configuration-box-list input3" type="text" 
                placeholder="Tópico do Comando de Nav2" value={robotData.topic_goal_pose}
                onChange={(e) => { setrobotData({ ...robotData, topic_goal_pose: e.target.value }) }}
              />
            </div>

            <div className='configuration-header borderless'>
              <h2>Frames</h2>
            </div>

            <div className='configuration-box topics'>
              <div className='configuration-box-list h3'> Frame do Mapa: </div>
              <input className="configuration-box-list input3" type="text" 
                placeholder="Frame do Mapa" value={robotData.frame_map}
                onChange={(e) => { setrobotData({ ...robotData, frame_map: e.target.value }) }}
              />
            </div>
            </>
            : null}

          </div>
        </div>
    );
}