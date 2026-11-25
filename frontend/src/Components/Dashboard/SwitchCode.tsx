import { useRef } from 'react'
import { useStore } from 'zustand'
import { useSetAtom } from 'jotai'
import { ROStore } from '../../contexts/Store'
import { LogAtom } from '../../contexts/Molecule'
import { RosapiMenu } from '../Rosapi'
import { Map } from '../Map'


export const SwitchCode = ({ topic, which }: { topic: string, which: number }) => {
    const convert = useStore(ROStore, (s) => s.ConvertTopic)
    const setLogData = useSetAtom(LogAtom)
    const cameraLoadedRef = useRef<{ main: boolean | null; minor: boolean | null }>({  main: null,  minor: null });

    return (
        <>
        {which === 1 ? (
            <>
            <img src={ convert(topic) }
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
                <img src={ convert(topic) }
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

        {which === 3 ? (
            <>
                <RosapiMenu/>
            </>
        ) : (null) }

        {/* Adicionar método para reutilizar o mapa em diferentes tópicos em várias instâncias */}
        {which === 4 ? (
            <>
                <Map/>
            </>
        ) : (null) }
        </>
        );
    }