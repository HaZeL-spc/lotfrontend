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

  const [date, setDate] = useState<Date>(new Date());
  const [flightData, setFlightData] = useState([]);
  const [loading, setLoading] = useState(false);

  const validateData = (): boolean => {
    if (origin.iata === "") return false;
    if (destination.iata === "") return false;

    let diff = date.getTime() - new Date().getTime();
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
    let dateParam = getYearMonthDay(date);
    let dateStr = `${dateParam[0]}-${dateParam[1]}-${dateParam[2]}`;

    if (!validateData()) {
      // not correct data
      setDate(new Date());

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
    console.log(resultData);
    let uniqueData = [];
    let costs: number[];
    costs = [];

    //console.log(resultData.data);

    for (let i = 0; i < resultData.data.length; i++) {
      let item = resultData.data[i];
      console.log(item.price.total);
      console.log("----------------");
      let czyOk = true;
      for (let j = 0; j < costs.length; j++) {
        console.log(costs[j]);
        if (costs[j] === item.price.total) {
          czyOk = false;
          break;
        }
      }

      if (czyOk) {
        costs.push(item.price.total);
        uniqueData.push(item);
      }

      if (uniqueData.length == 6) break;
    }

    let uniqueDataNever: never[];
    uniqueDataNever = [];

    for (let i = 0; i < uniqueData.length; i++) {
      uniqueDataNever.push(uniqueData[i] as never);
    }

    setFlightData(uniqueDataNever);
    setLoading(false);
  };

  const onSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFlightData([]);
    setLoading(true);
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
    console.log(flights[0].itineraries[0].segments.length);
    return flights.map((el: any) => {
      const segments = flights[0].itineraries[0].segments;
      const departure = new Date(segments[0].departure.at);

      let hourArrival = departure.getHours();
      let minuteArrival = departure.getMinutes();

      let result1 = getHourMinutes(hourArrival, minuteArrival);

      const lastIndex = segments.length - 1;
      const arrival1 = new Date(segments[lastIndex].arrival.at);
      const diffInMs = arrival1.getTime() - departure.getTime();

      // Get the time difference in minutes
      const diffInMinutes =
        (Math.floor(Math.floor(diffInMs / (1000 * 60)) * 100) / 100) % 60;

      // Get the time difference in hours
      const diffInHours =
        Math.floor(Math.floor(diffInMs / (1000 * 60 * 60)) * 100) / 100;

      let result2 = getHourMinutes(diffInHours, diffInMinutes);

      return (
        <div className="flight-info">
          <h1>
            {result1[0]}:{result1[1]}
          </h1>
          <h1>
            {result2[0]}:{result2[1]}
          </h1>
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
          <DatePicker selected={date} onChange={(date: any) => setDate(date)} />
          <button className="button-lot form-button">Submit</button>
          {loading && <h1>waiting...</h1>}
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
