import { Checkbox, FormControl, FormHelperText, ListItemText, MenuItem, Select, TextField, } from "@mui/material";
import { textFieldStyle } from "../../services/HelperService";
import Autocomplete from "@mui/material/Autocomplete";
import { IMAGES_ICON } from "../../assets/images/exportImages";

export default function CustomSelect({ className = "", placeholder = "Select", menuItem = [], value = "", onChange, padding = "none", error = false, helperText = "", }: any) {
  return (
    <>
      <FormControl size="small" className="" fullWidth sx={{ ...textFieldStyle }} error={error}      >
        <Select className={`${className} text-content-center`} label=" "
          sx={{
            "& legend": { display: "none" },
            "& fieldset": { top: 0 },
            alignContent: "center",
            "& .MuiSelect-select": {
              padding: padding ? `${padding}` : "none",
            },
            "& .MuiSelect-select::before": {
              content: value ? "''" : "'" + `${placeholder}` + "'",
              color: "#a2a2a2",
              fontSize: "14px !important",
              fontWeight: 300,
            },
          }}
          IconComponent={(props) => (
            <span role="button" {...props} style={{ marginTop: -4 }}>
              <img height={12} className="filterMuted" src={IMAGES_ICON.DownLineIcon} />
            </span>
          )}
          value={value}
          onChange={onChange}
        >{...menuItem}</Select>
      </FormControl>
      <FormHelperText className="text-danger">{helperText}</FormHelperText>
    </>
  );
}

export function CustomAutoSelect({
  placeholder = "Search",
  menuItem = [],
  value = "",
  onChange,
  padding = "none",
  error = false,
  helperText = "",
  readOnly = false,
}: any) {
  const selectedOption = menuItem.find((item: any) => item?.value === value);
  return (
    <>
      <Autocomplete
        fullWidth
        readOnly={readOnly}
        options={[...menuItem]}
        value={selectedOption || null}
        getOptionLabel={(option: any) => option?.title || ""}
        isOptionEqualToValue={(option: any, value: any) =>
          option?.value === value
        }
        onChange={(event: any, newValue: any | null) => {
          console.log(event);
          onChange(newValue ? newValue?.value : null);
        }}
        sx={{
          "& legend": { display: "none" },
          "& fieldset": { top: 0 },
          alignContent: "center",
          "& .MuiSelect-select": {
            padding: padding ? `${padding}` : "none",
          },
          "& .MuiSelect-select::before": {
            content: value ? "''" : "'" + `${placeholder}` + "'",
            color: "#a2a2a2",
            fontSize: "14px !important",
            fontWeight: 300,
          },
        }}
        renderInput={(params) => (
          <TextField
            placeholder={placeholder}
            className=""
            autoComplete="off"
            {...params}
            fullWidth
            label=" "
            InputLabelProps={{ shrink: true }}
            sx={{ ...textFieldStyle }}
            error={error}
          />
        )}
      />
      <FormHelperText className="text-danger">{helperText}</FormHelperText>
    </>
  );
}

export function CustomAutoMultiSelect({
  placeholder = "Search",
  menuItem = [],
  value = [],
  onChange,
  padding = "none",
  error = false,
  helperText = "",
  disableCloseOnSelect = true,
}: any) {
  const selectedOptions = menuItem?.filter((item: any) =>
    value?.includes(item?.value)
  );

  return (
    <>
      <Autocomplete
        multiple
        options={menuItem}
        disableCloseOnSelect={disableCloseOnSelect}
        value={selectedOptions}
        getOptionLabel={(option: any) => option?.title || ""}
        isOptionEqualToValue={(option: any, value: any) =>
          option?.value === value?.value
        }
        onChange={(event: any, newValue: any[] | null) => {
          console.log(event);
          onChange(newValue ? newValue.map((item) => item?.value) : []);
        }}
        sx={{
          "& legend": { display: "none" },
          "& fieldset": { top: 0 },
          alignContent: "center",
          "& .MuiSelect-select": {
            padding: padding ? `${padding}` : "none",
          },
          "& .MuiSelect-select::before": {
            content: value.length ? "''" : `'${placeholder}'`,
            color: "#a2a2a2",
            fontSize: "14px !important",
            fontWeight: 300,
          },
        }}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox className="p-0" checked={selected} />
            <ListItemText className="ms-2 p-0" primary={option?.title} />
          </li>
        )}
        renderInput={(params) => (
          <TextField
            placeholder={placeholder}
            {...params}
            fullWidth
            size="small"
            label=" "
            InputLabelProps={{ shrink: true }}
            error={error}
            style={{ backgroundColor: "#F3F3F3" }}
            autoComplete="off"
          />
        )}
      />
      <FormHelperText className="text-danger">{helperText}</FormHelperText>
    </>
  );
}

export function CustomFilterMultiSelect({ className = '', placeholder = 'Select', menuItem = [], value = [], onChange, error = false, helperText = "", }: any) {
  return (
    <>
      <FormControl size="small" fullWidth className={className} error={error} sx={{ ...textFieldStyle }}>
        <Select className={className} multiple displayEmpty value={value} onChange={onChange}
          renderValue={(selected: any) => {
            if (!selected.length) {
              return <span style={{ color: '#a2a2a2', fontWeight: 300 }}>{placeholder}</span>;
            }
            return `${selected.length} selected`;
          }}
          sx={{
            "& legend": { display: "none" },
            "& fieldset": { top: 0 },
            alignContent: 'center',
            '& .MuiSelect-select': {
              padding: "0px 6px"//padding ? `${padding}` : 'none',
            },
            '& .MuiSelect-select::before': {
              content: value ? "''" : "'" + `${placeholder}` + "'",
              color: "#a2a2a2",
              fontSize: "14px !important",
              fontWeight: 300
            },
          }}
          IconComponent={(props) => (
            <span role="button" {...props} style={{ marginTop: -4 }}>
              <img height={12} className="filterMuted" src={IMAGES_ICON.DownLineIcon} alt="dropdown" />
            </span>
          )}
        >
          {menuItem.map((item: any, index: number) => (
            <MenuItem key={index} value={item.value}>
              <Checkbox checked={value.indexOf(item.value) > -1} size="small" style={{ padding: 0, marginRight: 8 }} />
              <ListItemText primary={item.title} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {helperText && <FormHelperText className="text-danger">{helperText}</FormHelperText>}
    </>
  );
}
