import { useState, useEffect } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
}: SearchInputProps) {
  const [internal, setInternal] = useState(value);

  useEffect(() => {
    setInternal(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (internal !== value) {
        onChange(internal);
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [internal, debounceMs]);

  return (
    <TextField
      size="small"
      value={internal}
      onChange={(e) => setInternal(e.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      sx={{ width: { xs: '100%', sm: 280 } }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 20, color: 'action.active' }} />
            </InputAdornment>
          ),
          endAdornment: internal ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => {
                  setInternal('');
                  onChange('');
                }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
    />
  );
}
