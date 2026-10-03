import { useState, useEffect, useRef, useCallback } from 'react'
import { BatteryView } from './Battery';
import { MessageLog } from './MessageLog';
import './Intro.css'
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useStore } from 'zustand'
import { GlobalStore, ROStore } from '../contexts/Store'
import { useAtom, useSetAtom } from 'jotai';
import { LogAtom, ShowBatteryAtom, VozAtivaAtom } from '../contexts/Molecule'

const MAX_FACE_ATTEMPTS = 3;
const FACE_RETRY_DELAY_MS = 4000;

export const Intro = () => {
  const User = useStore(GlobalStore, (s) => s.User)          //Variáveis Globais
  const setUser = useStore(GlobalStore, (s) => s.setUser)
  const userConfig = useStore(GlobalStore, (s) => s.userConfig)
  const setuserConfig = useStore(GlobalStore, (s) => s.setuserConfig)
  const ros = useStore(ROStore, (s) => s.ros)
  const isConnected = useStore(ROStore, (s) => s.isConnected)
  const Battery = useStore(ROStore, (s) => s.batteryData)
  const [ShowBattery, setShowBattery] = useAtom(ShowBatteryAtom)
  const setLogData = useSetAtom(LogAtom)
  const setVozAtiva = useSetAtom(VozAtivaAtom)

  const [isReturning, setIsReturning] = useState(false);      // Flag para detectar retorno
  const [LeaveIntro, setLeaveIntro] = useState(false);        // Flag para detectar saída
  const [faceStatusMsg, setFaceStatusMsg] = useState<string | null>(null); // Mensagem isolada do reconhecimento facial
  const loginRef = useRef<HTMLDivElement>(null);              // Referência para a div principal
  const introsleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const faceAttemptsRef = useRef(0);            // conta tentativas sem causar re-render
  const faceRecognitionStopped = useRef(false); // trava novas tentativas após esgotar ou logar
  const hostIP = useStore(ROStore, (s) => s.ros.hostIP)

  // Efeito para ligar a webcam assim que o componente carrega
  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      console.warn("getUserMedia indisponível (contexto não seguro ou API ausente)");
    return;
    }

    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        const videoElement = document.getElementById('webcam-login') as HTMLVideoElement;
        if (videoElement) {
          videoElement.srcObject = stream;
        }
      })
      .catch((err) => console.error("Erro ao acessar a webcam da IHM: ", err));
  }, []);

  useEffect(() => {  // Efeito para apressar a animação no retorno
    if (!userConfig.Login && isReturning && loginRef.current) {
      loginRef.current.style.setProperty('--anim-duration', '1.5s');
      loginRef.current.style.setProperty('--anim-delay', '0.3s');
      setIsReturning(false);
    }
  }, [userConfig.Login, isReturning]);

  // Captura o frame atual da webcam e devolve como Blob (usado tanto no login manual quanto no facial)
  const captureFrame = async (): Promise<Blob | null> => {
    const videoElement = document.getElementById('webcam-login') as HTMLVideoElement;
    if (!videoElement || videoElement.videoWidth === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  };

  // Aplica o resultado de um login bem-sucedido (usado pelo facial e pelo manual)
  const applyLoginSuccess = useCallback((data: any) => {
    const isAdminUser = data.tipo_usuario === 'admin';
    const isDeficiente = data.tipo_usuario === 'usuario_def';
    faceRecognitionStopped.current = true;
    setFaceStatusMsg(null);
    setVozAtiva(isDeficiente); // só ativa a leitura em voz para o usuário deficiente

    setuserConfig({Login: true, isAdmin: isAdminUser, Intro: true});
    setIsReturning(false);
    setLogData({
      msg: `Seja bem vindo, ${data.username || User.name}!`,
      id: Date.now(),
      error: false
    });
  }, [setuserConfig, setLogData, setVozAtiva, User.name]);

  // Tenta o reconhecimento facial (roda sozinho, sem o usuário clicar em nada)
  const TryFaceLogin = useCallback(async () => {
    if (faceRecognitionStopped.current) return;

    try {
      const blob = await captureFrame();
      if (!blob) return; // webcam ainda não está pronta, tenta de novo no próximo ciclo

      const formData = new FormData();
      formData.append('file', blob, 'webcam_snapshot.jpg');

      setFaceStatusMsg("Iniciando reconhecimento facial");

      const response = await fetch(`http://${hostIP}:8000/api/login-face`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.sucesso) {
        applyLoginSuccess(data);
        return;
      }

      // Não reconheceu: mostra aviso (visual), soma tentativa e decide se tenta de novo
      setFaceStatusMsg("Reconhecimento facial inválido");
      faceAttemptsRef.current += 1;
      if (faceAttemptsRef.current >= MAX_FACE_ATTEMPTS) {
        faceRecognitionStopped.current = true;
        setFaceStatusMsg(null); // some do canto quando desiste, deixa só o form manual
      }

    } catch (error) {
      // Backend pode estar fora, ou rota ainda não existir — não trava a tela de login manual
      console.error("Erro no reconhecimento facial:", error);
      faceAttemptsRef.current += 1;
      if (faceAttemptsRef.current >= MAX_FACE_ATTEMPTS) {
        faceRecognitionStopped.current = true;
        setFaceStatusMsg(null);
      }
    }
  }, [hostIP, applyLoginSuccess]);

  // Dispara as tentativas de reconhecimento facial automaticamente ao carregar a tela
  useEffect(() => {
    if (userConfig.Login === true) return;

    let cancelled = false;

    const loop = async () => {
      while (!cancelled && !faceRecognitionStopped.current && faceAttemptsRef.current < MAX_FACE_ATTEMPTS) {
        await TryFaceLogin();
        if (cancelled || faceRecognitionStopped.current) break;
        await introsleep(FACE_RETRY_DELAY_MS);
      }
    };

    // pequeno delay inicial pra dar tempo da webcam ligar
    const timeout = setTimeout(loop, 1000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [userConfig.Login, TryFaceLogin]);

  // Login manual (usuário/senha), continua existindo como fallback
  const HandleLogin = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append('username', User.name);
      formData.append('password', User.password);

      const blob = await captureFrame();
      if (blob) {
        formData.append('file', blob, 'webcam_snapshot.jpg');
      }

      const response = await fetch(`http://${hostIP}:8000/api/login-form`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.sucesso) {
        applyLoginSuccess(data);
      } else {
        setLogData({msg: data.mensagem || "Credenciais inválidas", id: Date.now(), error: true});
      }

    } catch (error) {
      console.error(error);
      setLogData({msg: "Erro de conexão com o servidor", id: Date.now(), error: true});
    }
  }, [User, hostIP, applyLoginSuccess, setLogData]);

  useEffect(() => {
    if (userConfig.Login === true){return}

    const HandleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter'){HandleLogin();}
    }
    window.addEventListener('keydown', HandleKey);
    return () => {window.removeEventListener('keydown', HandleKey);};
  }, [userConfig.Login, HandleLogin]);

  const HandleLeave = async () => {
    setLeaveIntro(true);
    await introsleep(3600);
    setuserConfig({...userConfig, Intro: false});
  }

  return (
    <div className={`Intro ${LeaveIntro ? 'disappear' : 'start'}`}>
      <main>
        {/* Elemento de vídeo oculto necessário para capturar o frame da webcam */}
        <video id="webcam-login" autoPlay playsInline muted style={{ display: 'none' }}></video>

        <div className="Intro-title">
          <h1>GIPAR</h1>
        </div>

        <MessageLog/>

        {/* Mensagem isolada do reconhecimento facial, em canto separado do MessageLog (que mostra status do ROS) */}
        {faceStatusMsg && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(48, 233, 150, 0.6)',
            color: 'rgba(48, 233, 150, 0.96)',
            padding: '10px 16px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            zIndex: 999
          }}>
            <i className="bi bi-webcam-fill" style={{ fontSize: '1.1rem' }}></i>
            {faceStatusMsg}
          </div>
        )}

        {isConnected ?
          <div className='Intro-Battery'>
            <BatteryView/>
          </div>
        : (null)}

        {userConfig.Login !== true ? ( /* Tela de Login — sempre visível, mesmo com reconhecimento facial rodando por trás */

          <div className="Intro-login" ref={loginRef}>
            <div className='Intro-login-headerbar'>
              <p>Faça seu Login</p>
            </div>

            <div className='Intro-image'></div>

            <div className='Intro-login-wrapper'>
              <div className='Intro-login-label'>
                <h6>Usuário:</h6>
              </div>
              <input
                type="text"
                placeholder="Digite o seu nome de usuário"
                value={User.name}
                onChange={(e) => setUser({...User, name: e.target.value})}
                className="Intro-login-bar"
              />
            </div>

            <div className='Intro-login-wrapper'>
              <div className='Intro-login-label'>
                <h6>Senha:</h6>
              </div>
              <input
                type="password"
                placeholder="Digite sua senha"
                value={User.password}
                onChange={(e) => setUser({...User, password: e.target.value})}
                className="Intro-login-bar"
              />
            </div>

            <div className='Intro-login-button'
              onClick={() => {HandleLogin()}}>
              <p>Entrar</p>
            </div>
          </div>
        ) : (
          <>
          {userConfig.isAdmin === true ? ( /* Desenvolvedores: Seleção de Configurações Iniciais */
            <>
              <div className="Intro-configbox">
                <div className='Intro-configbox-headerbar'>
                  <h2>Bem vindo/a, {User.name}!</h2>
                </div>

                <div className='Intro-second-image'></div>

                <h3>Selecione as Configurações Iniciais, pressione o botão "Continuar" quando finalizado <br/><br/></h3>

                <div className='Intro-configbox-textwrapper'>
                  <p> <span> <strong> ➖ Mostrar Estado da Bateria: </strong></span></p>

                  <div className={`Intro-configbox-slider ${ShowBattery ? 'active' : null }`} onClick={() => setShowBattery(!ShowBattery)}>
                    <div className={`Intro-configbox-slider-dot ${ShowBattery ? 'active' : null }`}></div>
                  </div>
                </div>

                <span><br/></span>

                <div className='Intro-configbox-textwrapper'>
                  <p> <span> <strong> ➖ Visualização de Usuário: </strong></span></p>

                  <div className={`Intro-configbox-slider ${userConfig.isAdmin ? null : 'active' }`}
                    onClick={() => {setuserConfig({...userConfig, isAdmin: !userConfig.isAdmin}); setLogData({msg: "Desativado temporariamente os privilégios de Pesquisador!", id: Date.now(), error: false});}}>
                    <div className={`Intro-configbox-slider-dot ${userConfig.isAdmin ? null : userConfig.isAdmin }`}></div>
                  </div>
                </div>

                <div className='Intro-login-button'
                   onClick={() => {
                     HandleLeave();
                   }}>
                   Continuar
                </div>
              </div>

              <div className="Intro-backbutton"
                  onClick={() => {
                    setIsReturning(true);  // Marca que estamos retornando
                    setuserConfig({Login: false, isAdmin: false, Intro: true});
                    setLogData({msg: "Retornado para a tela inicial", id: Date.now(), error: false});
                  }}>
                  <p>&laquo;</p>
              </div>
            </>
          ) : ( /* Usuário Comum: Tela Auxiliar */
            <>
              <div className="Intro-configbox">
                <div className='Intro-configbox-headerbar'>
                  <h2>Bem vindo/a, {User.name}!</h2>
                </div>

                <div className='Intro-second-image'></div>

                <h3>{isConnected ? 'Robô conectado! Pressione o botão "continuar" para prosseguir' : 'Primeiramente, conecte-se ao robô antes de continuarmos'} <br/> <br/></h3>

                <div className='Intro-configbox-textwrapper'>
                  <p> <span> <strong> ➖ Conexão com o Robô: </strong> {isConnected === true ? <span style={{ color: 'rgba(48, 233, 150, 0.96)' }}>Online</span> : <span style={{ color: 'rgba(162, 90, 90, 0.96)' }}>Offline</span>} </span></p>
                </div>

                <span><br/></span>

                <div className='Intro-configbox-textwrapper'>
                  <p> <span> <strong> ➖ Estado da Bateria: </strong> {isConnected === true ? Battery.status : 'Conecte ao Robô!'} </span></p>
                </div>


                {isConnected === true ?
                <>
                  <div className='Intro-login-button'
                    onClick={() => {
                      HandleLeave();
                    }}>
                    Continuar
                  </div>
                </>
                :
                  <div className='Intro-login-button'
                    onClick={() => {
                      ros.connect()
                    }}>
                    Conectar-se ao Robô
                  </div>
                }
              </div>

              <div className="Intro-backbutton"
                onClick={() => {
                  setIsReturning(true);  // Marca que estamos retornando
                  setuserConfig({Login: false, isAdmin: false, Intro: true});
                  setLogData({msg: "Retornado para a seleção de modos", id: Date.now(), error: false});
                }}>
                <p>&laquo;</p>
              </div>
            </>
          )}
          </>
        )}

      </main>
    </div>
  )
}

export default Intro