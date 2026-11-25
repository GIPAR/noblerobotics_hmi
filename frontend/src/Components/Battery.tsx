import { useEffect } from 'react';
import { useStore } from 'zustand';
import { useSetAtom } from 'jotai'
import { ROStore } from '../contexts/Store';
import { BatteryAtom, LogAtom } from '../contexts/Molecule';
import './Battery.css'

type BatteryMessage = {
    voltage: number;
    percentage: number;
    power_supply_status: number;
    power_supply_health: number;
}

export const BatteryView = () => {
    const isConnected = useStore(ROStore, (s) => s.isConnected)
    const ros = useStore(ROStore, (s) => s.ros)
    const Message = useStore(ROStore, (s) => s.batteryData)
    const project = useStore(ROStore, (state) => state.robotData.project)
    const battery_topic = useStore(ROStore, (state) => state.robotData.topic_battery)
    const setMessage = useStore(ROStore, (s) => s.setbatteryData)
    const setLogData = useSetAtom(LogAtom)
    const setisExpanded = useSetAtom(BatteryAtom)

    // UseEffect para lógica da Bateria para a NARA
    useEffect(() => {
        if(!isConnected || project !== 'noblenara') return;

        const HandleStatus = (voltage: number) => {
            if(voltage >= 25) { return 'Carregada' }
            else if(voltage >= 24.15) { return 'Boa' }
            else if(voltage >= 23.60){ return 'Fraca' }
            else if(voltage > 1){ return 'Depletada' }
            else{ return  'Desconhecida' }
        }

        const Battery_sub = ros.subscribe(
            battery_topic,
            'sensor_msgs/msg/BatteryState',
            (message) => { 
                const battery = message as BatteryMessage
                console.log('Setting voltage to:', battery.voltage);
                const newStatus = HandleStatus(battery.voltage);
                setMessage({voltage: battery.voltage, status: newStatus, percentage: battery.percentage});
            }
        );
        return() => {
            Battery_sub.unsubscribe();
        };
        }, [isConnected, ros, setMessage, project, battery_topic]);


        useEffect(() => {
            if(isConnected === false){
                setisExpanded(false);
            }
        }, [isConnected, setisExpanded])


        useEffect(() => {
            if(Message.status === 'Fraca'){
                setLogData({msg: "Bateria fraca, carregamento necessário!", id: Date.now(), error: true})
            }
            else if(Message.status === 'Depletada'){
                setLogData({msg: "Bateria em estado crítico, carregue imediatamente!!", id: Date.now(), error: true})
            }
        }, [Message.status, setLogData])

    return (
        <div className='Battery'>
            {isConnected === true ? 
            <div className={`Battery-Grid ${Message.status}`}>
                
                <div className='Battery-text'>
                    <h3>Bateria: {Message.status}</h3>
                </div>
                
                <div className='Battery-icon' onClick={() => { setisExpanded(prev => !prev) }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><line x1="40" y1="64" x2="216" y2="64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/><line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/><line x1="40" y1="192" x2="144" y2="192" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/><line x1="184" y1="192" x2="232" y2="192" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/><line x1="208" y1="168" x2="208" y2="216" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/></svg>
                </div>

                <div className='Battery-stack'>
                    <h4> - Tensão: {+Message.voltage.toFixed(2)} </h4>
                    <h4> - Porcentagem: {Message.percentage} </h4>
                </div>
            </div>
            : 
                <span style={{color: 'rgb(85, 165, 162)'}}><h3> Robô: Desconectado </h3></span>
            }
        </div>
    );
}