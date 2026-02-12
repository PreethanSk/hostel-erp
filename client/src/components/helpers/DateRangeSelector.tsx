import { useState } from "react";
import { MenuItem, TextField } from "@mui/material";
import moment from "moment";
import CustomSelect from "./CustomSelect";
import { DisableKeyUpDown, textFieldStyle } from "../../services/HelperService";

const DateRangeSelector = ({ handleChangeDate, className = "" }: any) => {
  const [range, setRange] = useState("Current Month");
  const [fromDate, setFromDate] = useState(
    moment().clone().startOf("month").format("YYYY-MM-DD")
  );
  const [toDate, setToDate] = useState(moment().format("YYYY-MM-DD"));

  const handleRangeChange = (event: any) => {
    const value = event.target.value;
    setRange(value);
    const today = moment();
    let _from = today.format("YYYY-MM-DD");
    let _to = today.format("YYYY-MM-DD");
    switch (value) {
      case "Today":
        _from = today.format("YYYY-MM-DD");
        _to = today.format("YYYY-MM-DD");
        break;
      case "Last Week":
        _from = today.clone().subtract(7, "days").format("YYYY-MM-DD");
        _to = today.format("YYYY-MM-DD");
        break;
      case "Last Month":
        _from = today.clone().subtract(1, "months").startOf("month").format("YYYY-MM-DD");
        _to = today.clone().subtract(1, "months").endOf("month").format("YYYY-MM-DD");
        break;
      case "Current Month":
        _from = today.clone().startOf("month").format("YYYY-MM-DD");
        _to = today.format("YYYY-MM-DD");
        break;
      case "Custom":
        break;
      default:
        break;
    }
    setFromDate(_from);
    setToDate(_to);
    handleChangeDate(_from, _to);
  };

  return (
    <div className="row align-items-center">
      <div className="col-md-4 my-2 px-1">
        <CustomSelect
          className={className}
          padding={"0px 10px"}
          value={range}
          onChange={handleRangeChange}
          placeholder={"Select Date Range"}
          menuItem={["Today", "Last Week", "Last Month", "Current Month", "Custom"]?.map((item: any) => (
            <MenuItem className="px-2 fs14" key={item} value={item}>{item}</MenuItem>
          ))}
        />
      </div>
      <div className="col-md-4 my-2 px-1">
        <TextField
          className={className}
          fullWidth
          type="date"
          autoComplete="off"
          onKeyDown={DisableKeyUpDown}
          value={fromDate}
          onChange={(e) => {
            handleChangeDate(e.target.value, toDate);
            setFromDate(e.target.value);
          }}
          sx={{ ...textFieldStyle, "& .MuiInputBase-input": { padding: "1px 10px !important", background: className?.split(" ")?.includes("bg-white") ? "#fff" : "#F3F3F3" } }}
          inputProps={{ readOnly: range !== "Custom" }}
          InputLabelProps={{ shrink: true }}
        />
      </div>
      <div className="col-md-4 my-2 px-1">
        <TextField
          className={className}
          fullWidth
          type="date"
          autoComplete="off"
          onKeyDown={DisableKeyUpDown}
          value={toDate}
          onChange={(e) => {
            handleChangeDate(fromDate, e.target.value);
            setToDate(e.target.value);
          }}
          sx={{ ...textFieldStyle, "& .MuiInputBase-input": { padding: "1px 10px !important", background: className?.split(" ")?.includes("bg-white") ? "#fff" : "#F3F3F3" } }}
          inputProps={{ readOnly: range !== "Custom" }}
          InputLabelProps={{ shrink: true }}
        />
      </div>
    </div>
  );
};

export default DateRangeSelector;
