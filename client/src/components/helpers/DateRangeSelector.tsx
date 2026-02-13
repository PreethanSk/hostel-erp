import { useState } from 'react';
import { Box, MenuItem, TextField } from '@mui/material';
import moment from 'moment';
import { DisableKeyUpDown } from '../../services/HelperService';

const DATE_RANGES = ['Today', 'Last Week', 'Last Month', 'Current Month', 'Custom'];

const DateRangeSelector = ({ handleChangeDate }: { handleChangeDate: (from: string, to: string) => void }) => {
  const [range, setRange] = useState('Current Month');
  const [fromDate, setFromDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));

  const handleRangeChange = (event: any) => {
    const value = event.target.value;
    setRange(value);
    const today = moment();
    let _from = today.format('YYYY-MM-DD');
    let _to = today.format('YYYY-MM-DD');

    switch (value) {
      case 'Today':
        _from = today.format('YYYY-MM-DD');
        _to = today.format('YYYY-MM-DD');
        break;
      case 'Last Week':
        _from = today.clone().subtract(7, 'days').format('YYYY-MM-DD');
        _to = today.format('YYYY-MM-DD');
        break;
      case 'Last Month':
        _from = today.clone().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
        _to = today.clone().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
        break;
      case 'Current Month':
        _from = today.clone().startOf('month').format('YYYY-MM-DD');
        _to = today.format('YYYY-MM-DD');
        break;
      case 'Custom':
        break;
      default:
        break;
    }

    setFromDate(_from);
    setToDate(_to);
    handleChangeDate(_from, _to);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <TextField
        select
        size="small"
        value={range}
        onChange={handleRangeChange}
        sx={{ minWidth: 150 }}
      >
        {DATE_RANGES.map((item) => (
          <MenuItem key={item} value={item}>{item}</MenuItem>
        ))}
      </TextField>
      <TextField
        size="small"
        type="date"
        autoComplete="off"
        onKeyDown={DisableKeyUpDown}
        value={fromDate}
        onChange={(e) => {
          setFromDate(e.target.value);
          handleChangeDate(e.target.value, toDate);
        }}
        slotProps={{ input: { readOnly: range !== 'Custom' } }}
        sx={{ minWidth: 150 }}
      />
      <TextField
        size="small"
        type="date"
        autoComplete="off"
        onKeyDown={DisableKeyUpDown}
        value={toDate}
        onChange={(e) => {
          setToDate(e.target.value);
          handleChangeDate(fromDate, e.target.value);
        }}
        slotProps={{ input: { readOnly: range !== 'Custom' } }}
        sx={{ minWidth: 150 }}
      />
    </Box>
  );
};

export default DateRangeSelector;
