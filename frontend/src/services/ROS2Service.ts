import { LogAtom } from "../contexts/Molecule";
import { ROStore } from "../contexts/Store";
import { getDefaultStore } from 'jotai';

interface RosBridgeMessage {
  op: string;
  topic?: string;
  msg?: unknown;
  values?: Record<string, string[]>;
}

export class ROS2Service {
  private ws: WebSocket | null = null;
  private listeners: { [topic: string]: ((message: unknown) => void)[] } = {};
  private unexpectedDisconnect: boolean | null = null;
  public hostIP = window.location.hostname;


  // Métodos Principais
  connect(url: string = `ws://${this.hostIP}:9090`): Promise<boolean> {
    return new Promise((resolve, reject) => {

      if(ROStore.getState().isConnected){ 
        resolve(true);
        getDefaultStore().set(LogAtom, {msg: "ROS2 Bridge já Conectado!", id: Date.now(), error: false});
        return;
      }

      try {
        this.ws = new WebSocket(url);	
        this.ws.onopen = () => {					    // Event handler: connection
          ROStore.getState().setisConnected(true);
          getDefaultStore().set(LogAtom, {msg: "Conectado com sucesso!", id: Date.now(), error: false});
          this.unexpectedDisconnect = true;
          resolve(true);
        };

        this.ws.onerror = (error) => {				// Event handler: failed connection
          console.error('ROS2 WebSocket error:', error);
          getDefaultStore().set(LogAtom, {msg: "Falha na conexão com o ROBÔ!", id: Date.now(), error: true});
          reject(error);
        };

        this.ws.onmessage = (event) => {			// Event handler: What to do when we receive ANY message from ROS2
          const data = JSON.parse(event.data); 				// Parse the JSON string back into a JavaScript object
          this.handleMessage(data);
        };

        this.ws.onclose = () => {					    // Event handler: closed connection || Checkar quando a conexão for cortada manualmente
          ROStore.getState().setisConnected(false)
          if(this.unexpectedDisconnect === true){getDefaultStore().set(LogAtom, {msg: "Desconectado inesperadamente do ROS2!", id: Date.now(), error: true});}
          else if(this.unexpectedDisconnect === false){getDefaultStore().set(LogAtom, {msg: "Robô desconectado pelo usuário", id: Date.now(), error: false});}
          this.unexpectedDisconnect = null;
        };

      } catch (error) {
        reject(error);
      }
    });
  }
  disconnect = () => {
    console.log(this.ws)
    if (this.ws) {
      this.stopRobot(); // Stop robot before disconnecting
      this.unexpectedDisconnect = false;
      this.ws.close();        // Close the WebSocket connection
      this.ws = null;         // Clear our reference
      ROStore.getState().setisConnected(false); // Update isConnected state
    }
  }
  private handleMessage(data: unknown) {
    const message = data as RosBridgeMessage; // Type assertion

    if (message.op === 'publish' && message.topic && this.listeners[message.topic]) {
    this.listeners[message.topic].forEach(callback => {
      callback(message.msg);
    });
    }

    if(message.op === 'service_response') {
      console.log("Service response:", message.values)
      ROStore.getState().setrosapiData(message.values ?? {});
    }
  }


  // Métodos de Inscrição
  subscribe = (topic: string, messageType: string, callback: (message: unknown) => void): { unsubscribe: () => void } => {
    if (!this.ws) {
        return { unsubscribe: () => {} }; // Dummy unsubscribe if not connected
    }

    const subscribeMessage = {
      op: 'subscribe',
      topic: topic,
      type: messageType
    };

    if ((!this.listeners[topic] || this.listeners[topic].length === 0) && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(subscribeMessage));
    }
    if (!this.listeners[topic]) {
      this.listeners[topic] = [];
    }
    this.listeners[topic].push(callback);

    return {  // We return an object for it to know easily how to unsubscribe later
      unsubscribe: () => {
        // We reuse the existing unsubscribe logic, but we handle the arguments for the user
        this.unsubscribe(topic, callback);
      }
    };
  }
  unsubscribe = (topic: string, callback: (message: unknown) => void) => {
    if (!this.listeners[topic]) return;
  
    this.listeners[topic] = this.listeners[topic].filter(cb => cb !== callback); // Remove this specific callback from the array
    if (this.listeners[topic].length === 0) {                                    // If no more listeners, unsubscribe from rosbridge
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        op: 'unsubscribe',
        topic: topic
      }));
      }
    delete this.listeners[topic];}
  }


  // Métodos de Advertise - Atualmente o rosbridge não suporta mudança de QoS
  // advertise = (topic: string, messageType: string, reliability: 'best_effort' | 'reliable', durability: 'volatile' | 'transient_local', depth: number) => {
  //   if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;

  //   const advertiseMessage = {
  //       op: 'advertise',
  //       topic: topic,
  //       type: messageType,

  //       qos: {
  //         reliability: reliability,
  //         durability: durability,
  //         history: 'keep_last',           // Posteriormente ver a necessidade de colocar 'keep_all', mas proceder com cautela caso sim
  //         depth: depth,
  //       },
        
  //   };
  //   this.ws.send(JSON.stringify(advertiseMessage));
  //   console.log('Advertise enviada ao ROS2!');
  //   return true;
  // }
  // unadvertise = (topic: string) => {
  //   if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;

  //   const unadvertiseMessage = {
  //       op: 'unadvertise',
  //       topic: topic,
  //   };
  //   this.ws.send(JSON.stringify(unadvertiseMessage));
  //   console.log('Unadvertise enviada ao ROS2!');
  //   return true;
  // }


  // Métodos de Publicação
  publish = (topic: string, messageType: string, message: unknown) => {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('Publicação Impossível: Não conectado ao ROS2');
      return;
    }
    const publishMessage = {
      op: 'publish',
      topic: topic,
      type: messageType,
      msg: message
    };
    this.ws.send(JSON.stringify(publishMessage));
  }
  publishVelocity = (linear: number, angular: number) => {
    const velocityMessage = {
      linear: {
        x: linear, // Rotation speed (left/right) -> Coloque "linear" para a cadeira física
        y: 0.0,
        z: 0.0
      },
      angular: {
        x: 0.0,
        y: 0.0,
        z: angular // Forward/backward speed -> Coloque "angular" para a cadeira física
      }
    };
    this.publish(ROStore.getState().robotData.topic_cmd_vel, 'geometry_msgs/Twist', velocityMessage);
    // console.log(`🚀 Velocidade Enviada: linear=${linear}, angular=${angular}`);
  }
  stopRobot = () => {
    this.publishVelocity(0, 0);
    console.log('Publicado comando de parar ao Robô.');
  }


  // Métodos de Manejamento com rosapi
  callrosapi = (call: string) => {
    if(!this.ws) {getDefaultStore().set(LogAtom, {msg: "ROSBridge não conectado!", id: Date.now(), error: true}); 
    return;}

    if(call == "topics" || call == "services" || call == "nodes"){
      this.ws.send(JSON.stringify({
      op: "call_service",
      service: `/rosapi/${call}`,
      id: Date.now(),
      args: {}
      }));
    }
  }

}