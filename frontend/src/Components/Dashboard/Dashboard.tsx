import { SwitchCode } from './SwitchCode';
import { useStore } from 'zustand';
import { GlobalStore, ROStore } from '../../contexts/Store';
import { useAtom } from 'jotai'
import { DashboardAtom, BatteryAtom, ShowTeleopAtom, ShowRosapiAtom, ShowMapAtom, ShowBatteryAtom, SectionsAtom, RobotsAtom, currentSectionAtom } from '../../contexts/Molecule';
import { useState, useEffect, useRef } from 'react';
import { Teleoperation } from '../../services/TeleopService';
import { BatteryView } from '../Battery';
import './Dashboard.css'

export const Dashboard = () => {
    const [isFull, setisFull] = useState(false)
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const isConnected = useStore(ROStore, (s) => s.isConnected)
    const userConfig = useStore(GlobalStore, (s) => s.userConfig)
    
    const [Sections] = useAtom(SectionsAtom)
    const [StartTeleop] = useAtom(ShowTeleopAtom)
    const [ShowRosapi] = useAtom(ShowRosapiAtom)
    const [ShowMap] = useAtom(ShowMapAtom)
    const [isExpanded] = useAtom(BatteryAtom)
    const [ShowBattery] = useAtom(ShowBatteryAtom)

    const [Selection, setSelection] = useAtom(DashboardAtom)
    const [currentSection, setcurrentSection] = useAtom(currentSectionAtom)

    const [sRobot, setRobots] = useAtom(RobotsAtom)
    const keys = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth"] as const;
    const [keysConf, setkeysConf] = useState({ first: false, second: false, third: false, fourth: false, fifth: false, sixth: false, seventh: false, eighth: false, ninth: false })
    const gridRef = useRef<HTMLDivElement>(null);              // Referência para a div principal

    // Develop: Ver se á outra maneira para selecionar se vai mudar o "main" ou o "firstside", tentei guardar uma string e jogar dentro do set mas não funcionou, porém talvez errei a sintaxe

    const HandleReload = async (auxiliar: number, which: number) => {
        if(which === 1){
            setSelection({ ...Selection, main: 0 });
            await sleep(30);
            setSelection({ ...Selection, main: auxiliar })
        }
        else if(which === 2){
            setSelection({ ...Selection, firstside: 0 });
            await sleep(30);
            setSelection({ ...Selection, firstside: auxiliar })
        }
    }

    useEffect(() => {
        if(!gridRef.current){ return }

        if( Sections === 1 ){
            gridRef.current.style.setProperty('--main-grid', "1fr");
        }
        else if( Sections === 2){
            gridRef.current.style.setProperty('--main-grid', "1fr 1fr");
        }
        else if( Sections >= 3 ){
            gridRef.current.style.setProperty('--main-grid', "1fr 1fr 1fr");
        }
    }, [Sections]);
    

    return (
        <div className='Dashboard' style={{ '--side-grid' : isFull ? '0fr' : '1fr'} as React.CSSProperties}>

            <div className='Dashboard-main' ref={gridRef}>

                {keys.slice(0, Sections).map((key) => (
                    <div className='Dashboard-main-container' key={key}>
                        {sRobot[key].robot === "" ? null : <SwitchCode robot={sRobot[key].robot} which={sRobot[key].which} /> }

                        <div className='Dashboard-icon configuration'
                            onClick={() => { setcurrentSection(key); setkeysConf({ ...keysConf, [key]: !keysConf[key] }) }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="#15c8ce9d" viewBox="0 0 256 256"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm109.94-52.79a8,8,0,0,0-3.89-5.4l-29.83-17-.12-33.62a8,8,0,0,0-2.83-6.08,111.91,111.91,0,0,0-36.72-20.67,8,8,0,0,0-6.46.59L128,41.85,97.88,25a8,8,0,0,0-6.47-.6A112.1,112.1,0,0,0,54.73,45.15a8,8,0,0,0-2.83,6.07l-.15,33.65-29.83,17a8,8,0,0,0-3.89,5.4,106.47,106.47,0,0,0,0,41.56,8,8,0,0,0,3.89,5.4l29.83,17,.12,33.62a8,8,0,0,0,2.83,6.08,111.91,111.91,0,0,0,36.72,20.67,8,8,0,0,0,6.46-.59L128,214.15,158.12,231a7.91,7.91,0,0,0,3.9,1,8.09,8.09,0,0,0,2.57-.42,112.1,112.1,0,0,0,36.68-20.73,8,8,0,0,0,2.83-6.07l.15-33.65,29.83-17a8,8,0,0,0,3.89-5.4A106.47,106.47,0,0,0,237.94,107.21Zm-15,34.91-28.57,16.25a8,8,0,0,0-3,3c-.58,1-1.19,2.06-1.81,3.06a7.94,7.94,0,0,0-1.22,4.21l-.15,32.25a95.89,95.89,0,0,1-25.37,14.3L134,199.13a8,8,0,0,0-3.91-1h-.19c-1.21,0-2.43,0-3.64,0a8.08,8.08,0,0,0-4.1,1l-28.84,16.1A96,96,0,0,1,67.88,201l-.11-32.2a8,8,0,0,0-1.22-4.22c-.62-1-1.23-2-1.8-3.06a8.09,8.09,0,0,0-3-3.06l-28.6-16.29a90.49,90.49,0,0,1,0-28.26L61.67,97.63a8,8,0,0,0,3-3c.58-1,1.19-2.06,1.81-3.06a7.94,7.94,0,0,0,1.22-4.21l.15-32.25a95.89,95.89,0,0,1,25.37-14.3L122,56.87a8,8,0,0,0,4.1,1c1.21,0,2.43,0,3.64,0a8.08,8.08,0,0,0,4.1-1l28.84-16.1A96,96,0,0,1,188.12,55l.11,32.2a8,8,0,0,0,1.22,4.22c.62,1,1.23,2,1.8,3.06a8.09,8.09,0,0,0,3,3.06l28.6,16.29A90.49,90.49,0,0,1,222.9,142.12Z"></path></svg>
                        </div>

                        {keysConf[key] ? (
                            <div className='Dashboard-configuration'>
                                <div className='Dashboard-configuration-types'>
                                    
                                    <div className='Dashboard-configuration-types-button left' onClick={() => {
                                        if( sRobot[key].which !== 1){ 
                                            setRobots({ ...sRobot, [key]: { ...sRobot[key], which: (sRobot[key].which - 1) } })
                                        }
                                    }}>
                                        {"<"}
                                    </div>
                                    <div className='Dashboard-configuration-types-button right' onClick={() => {
                                        if( sRobot[key].which !== 4){ 
                                            setRobots({ ...sRobot, [key]: { ...sRobot[key], which: (sRobot[key].which + 1)} })
                                         }  
                                    }}>
                                        {">"}
                                    </div>

                                    {sRobot[key].which === 1 ? ("Câmera Principal") : (null)}
                                    {sRobot[key].which === 2 ? ("Câmera Secundária") : (null)}
                                    {sRobot[key].which === 3 ? ("Visualização do Mapa") : (null)}
                                    {sRobot[key].which === 4 ? ("Ativar Menu rosapi") : (null)}
                                    
                                </div>

                            </div>
                        ): null}
                    </div>
                ))}

                <div className='Dashboard-icon select'
                    onClick={() => { setisFull(!isFull) }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="#38bd9c" viewBox="0 0 256 256"><path d="M216,48V96a8,8,0,0,1-16,0V67.31l-42.34,42.35a8,8,0,0,1-11.32-11.32L188.69,56H160a8,8,0,0,1,0-16h48A8,8,0,0,1,216,48ZM98.34,146.34,56,188.69V160a8,8,0,0,0-16,0v48a8,8,0,0,0,8,8H96a8,8,0,0,0,0-16H67.31l42.35-42.34a8,8,0,0,0-11.32-11.32ZM208,152a8,8,0,0,0-8,8v28.69l-42.34-42.35a8,8,0,0,0-11.32,11.32L188.69,200H160a8,8,0,0,0,0,16h48a8,8,0,0,0,8-8V160A8,8,0,0,0,208,152ZM67.31,56H96a8,8,0,0,0,0-16H48a8,8,0,0,0-8,8V96a8,8,0,0,0,16,0V67.31l42.34,42.35a8,8,0,0,0,11.32-11.32Z"></path></svg>
                </div>

                <div className='Dashboard-icon reload'
                    onClick={() => { {HandleReload(Selection.main, 1)} }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="#38bd9c" viewBox="0 0 256 256"><path d="M224,128a96,96,0,0,1-94.71,96H128A95.38,95.38,0,0,1,62.1,197.8a8,8,0,0,1,11-11.63A80,80,0,1,0,71.43,71.39a3.07,3.07,0,0,1-.26.25L44.59,96H72a8,8,0,0,1,0,16H24a8,8,0,0,1-8-8V56a8,8,0,0,1,16,0V85.8L60.25,60A96,96,0,0,1,224,128Z"></path></svg>
                </div>

                {StartTeleop ? <Teleoperation/> : null}
            </div>

            <div className='Dashboard-side'>
                <div className={`Dashboard-side-status ${isExpanded ? 'Increase' : null}`}>
                    {ShowBattery === true ? <BatteryView/> : <h3> {isConnected ? (<span style={{ color: 'rgb(20, 202, 102)' }}>Bridge: Conectada</span>): (<span style={{ color: 'rgb(85, 190, 168)' }}>Bridge: Desconectada</span>)}</h3>}
                </div>

                {/* <div className='Dashboard-side-container'>
                    <SwitchCode robot={""} which={Selection.firstside}/>
                    <div className='Dashboard-icon select'
                        onClick={() => {
                            if(Selection.main === 1){setSelection({main: 2, firstside: 1} )}
                            else if(Selection.main === 2){setSelection({main: 1, firstside: 2} )} }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#26ac8f" viewBox="0 0 256 256"><path d="M213.66,181.66l-32,32a8,8,0,0,1-11.32-11.32L188.69,184H48a8,8,0,0,1,0-16H188.69l-18.35-18.34a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,213.66,181.66Zm-139.32-64a8,8,0,0,0,11.32-11.32L67.31,88H208a8,8,0,0,0,0-16H67.31L85.66,53.66A8,8,0,0,0,74.34,42.34l-32,32a8,8,0,0,0,0,11.32Z"></path></svg>
                    </div>

                    <div className='Dashboard-icon reload'
                        onClick={() => { {HandleReload(Selection.firstside, 2)} }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="#38bd9c" viewBox="0 0 256 256"><path d="M224,128a96,96,0,0,1-94.71,96H128A95.38,95.38,0,0,1,62.1,197.8a8,8,0,0,1,11-11.63A80,80,0,1,0,71.43,71.39a3.07,3.07,0,0,1-.26.25L44.59,96H72a8,8,0,0,1,0,16H24a8,8,0,0,1-8-8V56a8,8,0,0,1,16,0V85.8L60.25,60A96,96,0,0,1,224,128Z"></path></svg>
                    </div>
                </div> */}
                
                {ShowRosapi === true ? <div className='Dashboard-side-container'> <SwitchCode robot={""} which={3}/> </div> : null}

                {ShowMap === true && userConfig.isAdmin === true ?
                <div className='Dashboard-side-container'>
                    <SwitchCode robot={""} which={4}/>
                </div>
                : null}
            </div>

        </div>
    );
}