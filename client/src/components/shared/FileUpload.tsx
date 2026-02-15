import React, { MutableRefObject, useRef, useState } from 'react';
import { Box, Button, Typography, styled } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { gray, primary, radius } from '../../theme';

const HiddenInput = styled('input')({ display: 'none' });

interface FileUploadProps {
  fileName?: string;
  onUpload: (files: FileList) => void;
  label?: string;
  multiple?: boolean;
  accept?: string;
  error?: boolean;
  errorMsg?: string;
  hideLabel?: boolean;
}

export default function FileUpload({
  fileName,
  onUpload,
  label = 'Upload File',
  multiple = false,
  accept = '.pdf, image/*',
  error = false,
  errorMsg = '',
  hideLabel = false,
}: FileUploadProps) {
  const inputRef = useRef() as MutableRefObject<HTMLInputElement>;
  const [dragOver, setDragOver] = useState(false);

  const sendFiles = (files: FileList | null) => {
    if (files?.length) {
      onUpload(files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    sendFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sendFiles(e.target.files);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.value = '';
    }, 1000);
  };

  return (
    <Box>
      {!hideLabel && (
        <Typography sx={{ fontSize: '12px', fontWeight: 500, color: gray[700], mb: 0.75 }}>
          {label}
        </Typography>
      )}
      <Box
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          padding: '8px 12px',
          borderRadius: `${radius.md}px`,
          border: `1.5px dashed ${error ? '#F04438' : dragOver ? primary[400] : gray[300]}`,
          backgroundColor: dragOver ? primary[25] : gray[50],
          transition: 'border-color 200ms, background-color 200ms',
        }}
      >
        <Typography
          sx={{
            fontSize: '13px',
            color: fileName ? gray[700] : gray[400],
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          {fileName || label}
        </Typography>
        <Button
          component="label"
          size="small"
          variant="outlined"
          startIcon={<UploadFileIcon sx={{ fontSize: 16 }} />}
          sx={{
            color: gray[700],
            borderColor: gray[300],
            flexShrink: 0,
            '&:hover': { backgroundColor: gray[50], borderColor: gray[300] },
          }}
        >
          Browse
          <HiddenInput
            accept={accept}
            type="file"
            multiple={multiple}
            ref={inputRef}
            onChange={handleInputChange}
          />
        </Button>
      </Box>
      {error && errorMsg && (
        <Typography sx={{ fontSize: '12px', color: '#B42318', mt: 0.5 }}>
          {errorMsg}
        </Typography>
      )}
    </Box>
  );
}
