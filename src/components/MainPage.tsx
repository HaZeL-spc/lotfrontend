import React, { useRef } from "react";
import "../css/MainPage.css";

interface MainPageProps {
  // 👇️ turn off type checking
  setWhichWebsite: (params: string) => any;
}

const MainPage = ({ setWhichWebsite }: MainPageProps) => {
  const changeWebsite = () => {
    const mainTextContainer = document.getElementById(
      "mainTextContainer"
    ) as HTMLElement;

    const header = mainTextContainer.getElementsByTagName("h1")[0];
    const description = mainTextContainer.getElementsByTagName("h2")[0];
    const button = mainTextContainer.getElementsByTagName("button")[0];

    header.style.opacity = "0%";
    description.style.opacity = "0%";
    button.style.opacity = "0%";

    setTimeout(() => {
      setWhichWebsite("form");
    }, 500);
  };

  return (
    <div className="main-page">
      <div className="main-text" id="mainTextContainer">
        <h1>FIND YOUR FLIGHT</h1>
        <h2>
          On this website you can find flights which suits your journey. You can
          find about their costs and more!
        </h2>
        <button onClick={changeWebsite} className="button-lot">
          Let's begin!
        </button>
      </div>
    </div>
  );
};

export default MainPage;
