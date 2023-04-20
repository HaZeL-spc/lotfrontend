import React, { useEffect, useState } from "react";
import {
  Grid,
  InputAdornment,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import {
  LocationOn as PinIcon,
  Search as MagnifierIcon,
} from "@material-ui/icons";
import clsx from "clsx";
import search from "./api";

interface Option {
  code: string;
  city: string;
  state?: string;
  country: string;
}

const useStyles = makeStyles((theme) => ({
  // ...
}));

interface Props {
  setCityCode: (code: string) => void;
}

const Search: React.FC<Props> = ({ setCityCode }) => {
  const classes = useStyles();
  const [inputValue, setInputValue] = useState<string>("");
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    const { process, cancel } = search(inputValue);
    process((options: any) => {
      setOptions(options);
    });
    return () => cancel();
  }, [inputValue]);

  return (
    <div>
      <Autocomplete
        autoComplete
        autoHighlight
        freeSolo
        disableClearable
        blurOnSelect
        clearOnBlur
        options={options}
        onChange={(event, newValue: any) => {
          if (newValue) {
            setCityCode(newValue.code);
          }
        }}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        getOptionLabel={(option) => option.city || ""}
        renderOption={(option) => {
          return (
            <Grid container alignItems="center">
              <Grid item>
                <PinIcon />
              </Grid>
              <Grid item xs>
                <span>{option.city}</span>
                <Typography variant="body2" color="textSecondary">
                  {option.country}
                  {option.state ? `, ${option.state}` : ""}
                </Typography>
              </Grid>
            </Grid>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search"
            label="City"
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <MagnifierIcon />
                </InputAdornment>
              ),
            }}
          />
        )}
      />
    </div>
  );
};

export default Search;
