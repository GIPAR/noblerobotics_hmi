import { useRef } from 'react'
import { useStore } from 'zustand'
import { useSetAtom } from 'jotai'
import { ROStore } from '../../contexts/Store'
import { LogAtom } from '../../contexts/Molecule'
import { RosapiMenu } from '../Rosapi'
import { Map } from '../Map'


export const SwitchCode = ({ robot, which }: { robot: string, which: number }) => {
    const robotData = useStore(ROStore, (s) => s.robots[robot])
    const convert = useStore(ROStore, (s) => s.ConvertTopic)
    const setLogData = useSetAtom(LogAtom)
    const cameraLoadedRef = useRef<{ main: boolean | null; minor: boolean | null }>({  main: null,  minor: null });
    if (!robotData) return null

    return (
        <>
        {which === 1 ? (
            <>
            <img src={ convert(robotData.topic_camera_link) }
                onError={() => {
                    if(cameraLoadedRef.current.main !== false){
                        cameraLoadedRef.current.main = false;}
                    setLogData({msg: "Erro ao carregar a câmera principal, verifique a conexão.", id: Date.now(), error: true});}}
                onLoad={() => {
                    if (cameraLoadedRef.current.main !== true){
                        cameraLoadedRef.current.main = true
                        setLogData({msg: "Camera principal carregada com sucesso.", id: Date.now(), error: false})}}}/>
            </>
        ) : (null) }

        {which === 2 ? (
            <>
                <img src={ convert(robotData.topic_camera_user) }
                onError={() => {
                    if(cameraLoadedRef.current.minor !== false){
                        cameraLoadedRef.current.minor = false;}
                    setLogData({msg: "Erro ao carregar a câmera de usuário, verifique a conexão.", id: Date.now(), error: true});}}
                onLoad={() => {
                    if (cameraLoadedRef.current.minor !== true){
                        cameraLoadedRef.current.minor = true
                        setLogData({msg: "Camera de usuário carregada com sucesso.", id: Date.now(), error: false})}}}/>
            </>
        ) : (null) }

        {/* Adicionar método para reutilizar o mapa em diferentes tópicos em várias instâncias */}
        {which === 3 ? (
            <>
                <Map/>
            </>
        ) : (null) }

        {which === 4 ? (
            <>
                <RosapiMenu/>
            </>
        ) : (null) }
        </>
        );
    }