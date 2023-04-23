import React, { useEffect, useState } from "react";
import "../css/FlightForm.css";
import axios from "axios";
import { APIKEY, APISECRET } from "../AUTH";
import Search from "./Search";
import SearchAutocomplete from "./SearchAutocomplete";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface AirportState {
  iata: string;
  keyword: string;
  page: number;
  city: string;
  airport: string;
}

const FlightForm = () => {
  const [destination, setDestination] = useState<AirportState>({
    iata: "",
    keyword: "",
    page: 0,
    city: "",
    airport: "",
  });
  const [origin, setOrigin] = useState<AirportState>({
    iata: "",
    keyword: "",
    page: 0,
    city: "",
    airport: "",
  });

  const [dateFlight, setDateFlight] = useState<Date>(new Date());
  const [flightData, setFlightData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("loading useEffect");
    let load = document.getElementById("load-form") as HTMLElement;

    if (loading == true) {
      load.style.opacity = "1";
    } else {
      load.style.opacity = "0";
    }
  }, [loading]);

  const validateData = (): boolean => {
    console.log(origin, destination);

    if (origin.keyword === "") return false;
    if (destination.keyword === "") return false;
    const nextDay = new Date(dateFlight.getTime() + 24 * 60 * 60 * 1000);

    let diff = nextDay.getTime() - new Date().getTime();

    if (diff < 0) return false;

    return true;
  };

  const getYearMonthDay = (dateParam: Date): [string, string, string] => {
    let year = dateParam.getFullYear();
    let month = dateParam.getMonth() + 1;
    let day = dateParam.getDate();

    let yearStr = year.toString();
    let monthStr = month.toString();
    let dayStr = day.toString();

    // console.log(yearStr, monthStr, dayStr);

    if (month < 10) {
      monthStr = "0" + monthStr;
    }

    if (day < 10) {
      dayStr = "0" + dayStr;
    }

    return [yearStr, monthStr, dayStr];
  };

  const getFlightsData = async () => {
    const originProp = origin.iata;
    const destinationProp = destination.iata;
    let dateParam = getYearMonthDay(dateFlight);
    let dateStr = `${dateParam[0]}-${dateParam[1]}-${dateParam[2]}`;

    if (!validateData()) {
      // not correct data
      setDateFlight(new Date());

      setLoading(false);
      return;
    }

    const result = axios.get(`/api/search_flights`, {
      params: {
        origin: originProp,
        destination: destinationProp,
        date: dateStr,
      },
    });
    const resultData = (await result).data;

    if (resultData.data.length == 0) {
      let el = document.getElementById("error-communicate") as HTMLElement;
      el.innerHTML = "There are no flights";
    }

    console.log(resultData);
    let uniqueData = [];
    let starts: string[];
    starts = [];

    for (let i = 0; i < resultData.data.length; i++) {
      let item = resultData.data[i];

      let czyOk = true;
      for (let j = 0; j < starts.length; j++) {
        //console.log(item.itineraries[0].segments[0].departure.at);
        if (starts[j] === item.itineraries[0].segments[0].departure.at) {
          czyOk = false;
          break;
        }
      }

      if (czyOk) {
        starts.push(item.itineraries[0].segments[0].departure.at);
        item.start = new Date(item.itineraries[0].segments[0].departure.at);
        uniqueData.push(item);
      }
    }

    let uniqueDataNever: never[];
    uniqueDataNever = [];

    for (let i = 0; i < uniqueData.length; i++) {
      uniqueDataNever.push(uniqueData[i] as never);
    }
    console.log(uniqueDataNever);

    uniqueDataNever.sort((a: any, b: any) => a.start - b.start);
    setFlightData(uniqueDataNever);
    setLoading(false);
  };

  const onSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFlightData([]);
    setLoading(true);
    let el = document.getElementById("error-communicate") as HTMLElement;
    el.innerHTML = "";
    getFlightsData();
  };

  const getHourMinutes = (
    hourArrival: number,
    minuteArrival: number
  ): [string, string] => {
    let hourArrivalStr = hourArrival.toString();
    let minuteArrivalStr = minuteArrival.toString();

    if (hourArrival < 10) {
      hourArrivalStr = "0" + hourArrivalStr;
    }

    if (minuteArrival < 10) {
      minuteArrivalStr = "0" + minuteArrivalStr;
    }

    return [hourArrivalStr, minuteArrivalStr];
  };

  const renderFlights = (flights: any) => {
    console.log(flights[0].itineraries[0].duration);
    return flights.map((el: any) => {
      const segments = el.itineraries[0].segments;
      const departure = new Date(segments[0].departure.at);

      let hourArrival = departure.getHours();
      let minuteArrival = departure.getMinutes();

      let result1 = getHourMinutes(hourArrival, minuteArrival);
      let result2 = el.itineraries[0].duration.substring(2);

      return (
        <div className="flight-info">
          <h1>
            {result1[0]}:{result1[1]}
          </h1>
          <h1>{result2}</h1>
          <h1>{segments.length}</h1>
          <h1>{el.price.total}$</h1>
        </div>
      );
    });
  };

  return (
    <div className="flight-form">
      <div className="form-container">
        <form className="main-form" onSubmit={onSubmitForm}>
          <SearchAutocomplete
            search={origin}
            setSearch={setOrigin}
            placeholder="departure"
          />
          <SearchAutocomplete
            search={destination}
            setSearch={setDestination}
            placeholder="arrival"
          />
          {/* <input type="text" /> */}
          <DatePicker
            selected={dateFlight}
            onChange={(date: any) => setDateFlight(date)}
          />
          <button className="button-lot form-button">Submit</button>
          <div className="load" id="load-form"></div>
          <h1 id="error-communicate"></h1>
        </form>
      </div>
      <div className="flights-container">
        <div className="headers">
          <h1>Start</h1>
          <h1>Time</h1>
          <h1>Transfers</h1>
          <h1>Cost</h1>
        </div>
        {flightData.length > 0 && renderFlights(flightData)}
      </div>
    </div>
  );
};

export default FlightForm;
