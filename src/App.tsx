import React, { useEffect, useState } from "react";
import DarkModeSwitch from "./components/DarkModeSwitch.tsx";
import MainPage from "./components/MainPage.tsx";
import ViewerPage from "./components/ViewerPage.tsx";

const DARK_MODE_KEY = "dark-mode";

export default function App() {
  const [hasByteData, setHasByteData] = useState<boolean>(false);

  const [darkMode, setDarkMode] = React.useState(() => {
    return (
      JSON.parse(localStorage.getItem(DARK_MODE_KEY) as string) ??
      window.matchMedia?.("(prefers-color-scheme: dark)").matches
    );
  });
  useEffect(() => {
    localStorage.setItem(DARK_MODE_KEY, darkMode.toString());
  }, [darkMode]);

  return (
    <>
      {hasByteData ? (
        <ViewerPage />
      ) : (
        <MainPage onBytesReceived={() => setHasByteData(true)} />
      )}
      <div className="absolute top-2 right-2 w-5 h-5">
        <DarkModeSwitch checked={darkMode} set={setDarkMode} />
      </div>
    </>
  );
}
