import React, { useEffect, useRef, useState } from "react";

const ACCESS_KEY = import.meta.env.VITE_GLAMAR_ACCESS_KEY;

export default function GlamARViewer() {
  const containerRef = useRef(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const check = () => setSdkReady(!!window.GlamAR);
    check();
    const id = setInterval(check, 300);
    return () => clearInterval(id);
  }, []);

  const initSdk = () => {
    if (!window.GlamAR || !containerRef.current) {
      setError("GlamAR SDK not found. Check the script tag in index.html.");
      return;
    }
    try {
      // Provide the ACCESS_KEY inside the options object. Some SDK
      // versions expect the key in the options (appId/apiKey). Passing the
      // key as a standalone second argument can be misinterpreted by the
      // wrapper and lead to requests using 'undefined'. Use a single
      // options object to be explicit.
      window.GlamAR.init("glamar-container", {
        appId: ACCESS_KEY,
        apiKey: ACCESS_KEY,
        platform: "web",
        meta: { sdkVersion: "2.0.0" }, // <- added meta block
        category: "skinanalysis",
        configuration: {
          global: {
            openLiveOnInit: true,
            disableClose: false,
            disableBack: false,
          },
          skinAnalysis: {
            version: "GlamGen",
            defaultFilter: true,
            startScreen: true,
          },
        },
      });

      handleSdkEvents();
      setSdkInitialized(true);
      setError("");
    } catch (e) {
      setError(`SDK Init Failed: ${e?.message || e}`);
      console.error(e);
    }
  };

  function handleSdkEvents() {
    window.GlamAR.addEventListener("*", (event, payload) => {
      switch (event) {
        case "loaded":
          console.log("GlamAR loaded");
          break;
        case "camera-permission-denied":
          setError("Camera permission denied. Please allow camera access.");
          break;
        case "skin-analysis":
          if (payload?.options === "result") {
            console.log("Skin Analysis Result:", payload.value);
          }
          break;
        default:
          console.log("Event:", event, payload);
      }
    });
  }

  const enterFullscreen = async () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
    } catch (e) {
      console.warn("Fullscreen failed:", e);
    }
  };

  return (
    <div className="glamar-root">
      <div className="toolbar">
        <h1>GlamAR AR Try-On</h1>
        <div className="spacer" />
        {!sdkInitialized ? (
          <button className="btn" disabled={!sdkReady} onClick={initSdk}>
            {sdkReady ? "Start Camera" : "Loading SDK…"}
          </button>
        ) : (
          <button className="btn" onClick={enterFullscreen}>
            Fullscreen
          </button>
        )}
      </div>

      <div id="glamar-container" ref={containerRef} className="viewer" />

      {error && <div className="error">{error}</div>}
    </div>
  );
}
