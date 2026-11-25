import { useRef, useEffect, useState } from 'react'
import './Map.css'
import { useStore } from 'zustand'
import { useSetAtom } from 'jotai' 
import { ROStore } from '../contexts/Store'
import { LogAtom } from '../contexts/Molecule'

type MapMessage = {
    data: Int8Array;
    info: { width: number, height: number, resolution: number, origin: { position: { x: number, y: number, z: number } } };
}

type PoseMessage = {
        header: { frame_id: string };
        pose: { pose: { position: { x: 0, y: 0, z: 0 }, orientation: { x: 0, y: 0, z: 0, w: 0 } } };
}

export const Map = () => {
    // Variáveis do ROS2
    const isConnected = useStore(ROStore, (s) => s.isConnected)
    const ros = useStore(ROStore, (s) => s.ros)
    const map_topic = useStore(ROStore, (s) => s.robotData.topic_map)
    const pose_topic = useStore(ROStore, (s) => s.robotData.topic_pose)
    const goal_pose_topic = useStore(ROStore, (s) => s.robotData.topic_goal_pose)
    const frame_map = useStore(ROStore, (s) => s.robotData.frame_map)

    // Variáveis do Mapa
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const occupancyRef = useRef<Int8Array | null>(null);
    const infoRef = useRef<MapMessage['info'] | null>(null);

    // Variáveis da Navegação
    const navRef = useRef<HTMLDivElement>(null);
    const robotPoseRef = useRef({ translation: { x: 0, y: 0, z: 0 }, rotation: { z: 0, w: 0 } });

    // Variáveis Diversas
    const [publishedCommand, setpublishedCommand] = useState(false);
    const [receivedMap, setreceivedMap] = useState(false);
    const lastUpdated = useRef({ map: 0 });
    const setLogData = useSetAtom(LogAtom)

    const handlePointerDown = (e: React.PointerEvent) => {
        const info = infoRef.current;
        const canvas = canvasRef.current;
        const robot = robotPoseRef.current;
        if(!canvas || !info || !isConnected) return;

        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);

        const OriginPixels = { x: 0, y: 0};
        const CommandPixels = { x: 0, y: 0};
        const rotationCommand = { degrees: 0 };
        const robotCommand = { header: { frame_id: frame_map }, pose: { position: { x: 0, y: 0, z: 0 }, orientation: { z: 0, w: 0 } } }

        OriginPixels.x = (info.origin.position.x / info.resolution);
        OriginPixels.y = -(info.origin.position.y / info.resolution);

        const rect = canvas.getBoundingClientRect();
        CommandPixels.x = OriginPixels.x - (e.clientX - rect.right);
        CommandPixels.y = (e.clientY - rect.top) - OriginPixels.y;

        robotCommand.pose.position.x = CommandPixels.x * info.resolution;
        robotCommand.pose.position.y = CommandPixels.y * info.resolution;

        rotationCommand.degrees = Math.atan2(robotCommand.pose.position.x - robot.translation.x, -(robotCommand.pose.position.y - robot.translation.y)) - (Math.PI / 2)
        robotCommand.pose.orientation.z = Math.sin(rotationCommand.degrees / 2);
        robotCommand.pose.orientation.w = Math.cos(rotationCommand.degrees / 2);

        ros.publish(goal_pose_topic, 'geometry_msgs/msg/PoseStamped', robotCommand);
        setpublishedCommand(true);
        setLogData({msg: `Publicado Comando para a Posição:  'x: ${robotCommand.pose.position.x}' ::: 'y: ${robotCommand.pose.position.y}'`, id: Date.now(), error: false});
    };

    const updateNavigator = () => {
        const info = infoRef.current;
        const nav = navRef.current;
        const canvas = canvasRef.current;
        if(!info || !nav || !canvas) return;

        const OriginPixels = { x: 0, y: 0};
        const pixelsMove = { x: 0, y: 0};
        let rotation = 0;

        OriginPixels.x = info.width + (info.origin.position.x / info.resolution);
        OriginPixels.y = -(info.origin.position.y / info.resolution);

        pixelsMove.x = -(robotPoseRef.current.translation.x / info.resolution);
        pixelsMove.y = (robotPoseRef.current.translation.y / info.resolution);

        rotation = - Math.atan2(2 * (robotPoseRef.current.rotation.w * robotPoseRef.current.rotation.z), 1 - 2 * (robotPoseRef.current.rotation.z * robotPoseRef.current.rotation.z));
        rotation = rotation - (Math.PI / 4);

        nav.style.transform = `translate(calc(-50% + ${OriginPixels.x}px + ${pixelsMove.x}px + ${canvas.offsetLeft}px), calc(-50% + ${pixelsMove.y}px + ${OriginPixels.y}px)) rotate(${rotation}rad)`;
    }

    const Paint = () => {
        const data = occupancyRef.current;
        const info = infoRef.current;
        const canvas = canvasRef.current;
        if(!canvas || !info || !data) return;

        const ctx = canvas.getContext('2d');
        if(!ctx) return;

        const imageData = ctx.createImageData(info.width, info.height)

        for (let i = 0; i < data.length; i++){

            const color = data[i] === 100 ? 0 : data[i] === 0 ? 255 : 127

            imageData.data[4*i + 0] = color;
            imageData.data[4*i + 1] = color;
            imageData.data[4*i + 2] = color;
            imageData.data[4*i + 3] = 255;

        }

        ctx.putImageData(imageData, 0, 0)

    }

    useEffect(() => {
        if(!isConnected) return;

        const Map_sub = ros.subscribe(
            map_topic,
            'nav_msgs/msg/OccupancyGrid',
            (message) => { 
                const Map = message as MapMessage
                
                if(Date.now() > lastUpdated.current.map + 1500){
                    occupancyRef.current = Map.data;
                    infoRef.current = Map.info;

                    if(canvasRef.current){
                        canvasRef.current.width = infoRef.current.width;
                        canvasRef.current.height = infoRef.current.height;
                    }

                    Paint();
                    lastUpdated.current.map = Date.now();
                    setreceivedMap(true);
                }
            }
        );

        const Pose_sub = ros.subscribe(
            pose_topic,
            'geometry_msgs/msg/PoseWithCovarianceStamped', // POSSIVELMENTE NORMALIZAR TODOS OS TIPOS DE POSE POSSÍVEIS
            (message) => { 
                const Pose = message as PoseMessage

                robotPoseRef.current = { translation: Pose.pose.pose.position, rotation: Pose.pose.pose.orientation  }
                updateNavigator();
                // lastUpdated.current.robot = Date.now();
            }
        );


        return() => {
            Map_sub.unsubscribe();
            Pose_sub.unsubscribe();
            setreceivedMap(false);
        };
            }, [isConnected, ros, pose_topic, map_topic]);


    return(
        <div className='Map'>
            {   publishedCommand === false && isConnected === true ?
                <div className='Map-tutorial'>
                    Pressione no lugar desejado para publicar o comando de Navegação
                </div>
            : null }

            <canvas className='Map-canvas' onPointerDown={handlePointerDown} ref={canvasRef} width={ infoRef.current?.width } height={ infoRef.current?.height }> </canvas>

            {  receivedMap === true ?
                <div className='Map-navigator' ref={navRef}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><path d="M152,152,234.35,129a8,8,0,0,0,.27-15.21l-176-65.28A8,8,0,0,0,48.46,58.63l65.28,176a8,8,0,0,0,15.21-.27Z" opacity="0.1"/><path d="M152,152,234.35,129a8,8,0,0,0,.27-15.21l-176-65.28A8,8,0,0,0,48.46,58.63l65.28,176a8,8,0,0,0,15.21-.27Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/></svg>
                </div>  
            : null }
        </div>
        
    )
}