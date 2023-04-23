import React, { useCallback, useEffect } from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import axios from 'axios'
import { debounce } from "lodash"

const CancelToken = axios.CancelToken;

const getAmadeusData = params => {

    // Destructuring params
    const { keyword = "", page = 0, city = true, airport = true } = params;
  
    // Checking for proper subType 
    // const subTypeCheck = city && airport ? "CITY,AIRPORT" : city ? "CITY" : airport ? "AIRPORT" : ""
    const subTypeCheck = "AIRPORT";

    // Amadeus API require at least 1 character, so with this we can be sure that we can make this request
    const searchQuery = keyword ? keyword : "a";
  
    // This is extra tool for cancelation request, to avoid overload API 
    const source = CancelToken.source();
  
    // GET request with all params we need
    const out = axios.get(
      `/api/airports/?keyword=${searchQuery}&page=${page}&subType=${subTypeCheck}`
    )

  
    return { out, source }
  };

const SearchAutocomplete = (props) => {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [search, setSearch] = React.useState('')
  const [keyword, setKeyword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  // Configure options format for proper displaying on the UI
  const names = options.map(i => ({ type: i.subType, name: i.name, iata: i.iataCode }));

  // Debounce func prevents extra unwanted keystrokes, when user triggers input events 
  const debounceLoadData = useCallback(debounce(setKeyword, 500), []);

  useEffect(() => {
    debounceLoadData(search);
  }, [search]);

  // Same example as in *SearchRoot* component
  React.useEffect(() => {

    setLoading(true)
    const result = getAmadeusData({ ...props.search, page: 0, keyword })
    const { out, source } = result;

    out.then(res => {
      if (!res.data.code) {
        setOptions(res.data.data);
      }
      // console.log("correct")
      setLoading(false)
    }).catch(err => {
      console.log(err)
      axios.isCancel(err);
      setOptions([]);
      setLoading(false)

    });

    return () => {
      source.cancel()
    };
  }, [keyword]);

  // Desctructuring our props
  const { city, airport } = props.search

  const label = city && airport ? "City and Airports" : city ? "City" : airport ? "Airports" : ""

  return (
    // This is Material-UI component that also has it's own props
    <>
      <Autocomplete
        id="asynchronous-demo"
        open={open}
        onOpen={() => {
          setOpen(true);
        }}
        onClose={() => {
          setOpen(false);
        }}
        getOptionSelected={(option, value) =>
          option.name === value.name && option.type === value.type
        }
        onChange={(e, value) => {
          if (value && value.name) {
            props.setSearch((p) => ({ ...p, keyword: value.name, page: 0, iata: value.iata }))
            setSearch(value.name)
            return;
          }
          setSearch("")
          props.setSearch((p) => ({ ...p, keyword: "", page: 0, iata: "NYC" }))

        }}
        getOptionLabel={option => {
          return option.name;
        }}
        options={names}
        // loading={loading}
        renderInput={params => {
          return (
            <TextField
              label={label}
              fullWidth
              onChange={e => {
                e.preventDefault();
                setSearch(e.target.value);
              }}
              className="origin-airport"
              placeholder={props.placeholder}
              inputProps={{
                ...params.inputProps,
                value: search
              }}
              InputProps={{
                ...params.InputProps,
                // endAdornment: (
                //   // <React.Fragment>
                //   //   {loading ? (
                //   //     <CircularProgress color="inherit" size={20} />
                //   //   ) : null}
                //   //   {/* //{params.InputProps.endAdornment} */}
                //   // </React.Fragment>
                // )
              }}
            />
          );
        }}
      />
    </>
  )
};

export default SearchAutocomplete;