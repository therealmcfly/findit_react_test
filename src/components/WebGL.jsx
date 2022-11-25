import React, { useState, useEffect, useCallback } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

const projectsList =
  '{"projects" :[{"projName": "l_proj01", "imgUrl": "https://find-it.kr/mallimg/2022/11/15/1668495125_9798.jpg"}, {"projName": "l_proj10"}, {"projName": "l_proj15"}]}';

const username = "user01";

function WebGL({ sceneName, onClick }) {
  const [projectName, setProjectName] = useState();
  const [isProjWindowOpen, setProjWindowOpen] = useState(false);
  const [isEnteredScene, setIsEnteredScene] = useState(false);
  const [numOfPlayers, setNumOfPlayers] = useState();
  const [inputValue, setInputValue] = useState("");

  const {
    unityProvider,
    addEventListener,
    removeEventListener,
    sendMessage,
    isLoaded,
    loadingProgression,
    requestPointerLock,
  } = useUnityContext({
    loaderUrl: "webgl/build.loader.js",
    dataUrl: "webgl/build.data",
    frameworkUrl: "webgl/build.framework.js",
    codeUrl: "webgl/build.wasm",
  });

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  //React to Unity 함수
  const enterScene = () => {
    setIsEnteredScene(true);
    sendMessage(sceneName + "Manager", "enter" + sceneName, projectsList);
    sendMessage(sceneName + "Manager", "setUsername", username);
  };

  const closeProjWindow = () => {
    sendMessage(sceneName + "Manager", "closeProjWindow");
    sendMessage("Player(Clone)", "enablePlayerControl");
    setProjWindowOpen(false);
  };

  const popupChat = () => {
    sendMessage("ChatManager", "toggleChatContainer");
  };

  const submitInputValueToWebgl = () => {
    sendMessage(sceneName + "Manager", "submitInputField", inputValue);
  };
  //Unity to React 함수
  const interactProject = useCallback((projName) => {
    setProjWindowOpen(true);
    setProjectName(projName);
  }, []);

  const reqPointerLock = () => {
    requestPointerLock();
  };

  useEffect(() => {
    //Unity to React 이벤트 리스너
    addEventListener("focusProject", setProjectName); // projectName state로 바인딩
    addEventListener("interactProject", interactProject); // interactProject 함수로 바인딩
    addEventListener("updateNumOfPlayers", setNumOfPlayers); // interactProject 함수로 바인딩

    return () => {
      removeEventListener("focusProject", setProjectName);
      removeEventListener("interactProject", interactProject);
      removeEventListener("updateNumOfPlayers", setNumOfPlayers);
    };
  }, [
    addEventListener,
    removeEventListener,
    requestPointerLock,
    setProjectName,
    interactProject,
    setNumOfPlayers,
  ]);

  return (
    <>
      <div className="window">
        {!isLoaded ? (
          <h2>Loading WebGL... {Math.round(loadingProgression * 100)}%</h2>
        ) : (
          projectName &&
          (isProjWindowOpen ? (
            <h2>{"Interacted Project : " + projectName}</h2>
          ) : (
            <h2>{"Focused Project : " + projectName}</h2>
          ))
        )}
        {isLoaded &&
          (isEnteredScene || <button onClick={enterScene}>입장하기</button>)}
        {isProjWindowOpen && (
          <button onClick={closeProjWindow}>프로젝트 창 닫기</button>
        )}
      </div>
      <Unity
        style={{
          height: "80vh",
          width: "80%",
          justifySelf: "center",
          alignSelf: "center",
        }}
        unityProvider={unityProvider}
      />
      <div>
        <input type="text" onChange={handleChange} />
      </div>
      <button onClick={popupChat}>Chat</button>
      <h2>{numOfPlayers}</h2>
    </>
  );
}

export default WebGL;
