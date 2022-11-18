import React, { useState, useEffect, useCallback } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

const projectsList =
  '{"projects" :[{"projName": "l_proj01", "imgUrl" : ""}, {"projName": "l_proj10"}, {"projName": "l_proj15"}]}';

function WebGL({ sceneName }) {
  const [projectName, setProjectName] = useState();
  const [isProjWindowOpen, setProjWindowOpen] = useState(false);
  const [isEnteredScene, setIsEnteredScene] = useState(false);

  const {
    unityProvider,
    addEventListener,
    removeEventListener,
    sendMessage,
    isLoaded,
    loadingProgression,
  } = useUnityContext({
    loaderUrl: "Build/findit.loader.js",
    dataUrl: "Build/findit.data",
    frameworkUrl: "Build/findit.framework.js",
    codeUrl: "Build/findit.wasm",
  });

  //React to Unity 함수
  const enterScene = () => {
    setIsEnteredScene(true);
    sendMessage(sceneName + "Manager", "enter" + sceneName, projectsList);
  };

  const closeProjWindow = () => {
    sendMessage(sceneName + "Manager", "closeProjWindow");
    setProjWindowOpen(false);
  };

  //Unity to React 함수
  const interactProject = useCallback((projName) => {
    setProjWindowOpen(true);
    setProjectName(projName);
  }, []);

  useEffect(() => {
    //Unity to React 이벤트 리스너
    addEventListener("focusProject", setProjectName); // projectName state로 바인딩
    addEventListener("interactProject", interactProject); // interactProject 함수로 바인딩

    return () => {
      removeEventListener("focusProject", setProjectName);
      removeEventListener("interactProject", interactProject);
    };
  }, [addEventListener, removeEventListener, setProjectName, interactProject]);

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
        {!isProjWindowOpen || (
          <button onClick={closeProjWindow}>프로젝트 창 닫기</button>
        )}
      </div>
      <Unity
        style={{
          width: "100%",
          justifySelf: "center",
          alignSelf: "center",
        }}
        unityProvider={unityProvider}
      />
    </>
  );
}

export default WebGL;