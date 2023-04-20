import React, { useState } from "react";
import "./App.css";
import MainPage from "./components/MainPage";
import KokpitSamolotu from "./images/kokpitSamolotu.jpg";
import FlightForm from "./components/FlightForm";

function App() {
  const [whichWebsite, setWhichWebsite] = useState("main");

  return (
    <div className="App">
      <div className="container">
        <img src={KokpitSamolotu} className="background-image" />
        <div className="overlay-gradient"></div>
      </div>
      {whichWebsite === "main" ? (
        <MainPage setWhichWebsite={setWhichWebsite} />
      ) : (
        <FlightForm />
      )}
    </div>
  );
}

export default App;
