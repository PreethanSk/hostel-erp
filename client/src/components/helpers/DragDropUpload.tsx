import React, { MutableRefObject, useRef, useState } from 'react';
import { Button, styled } from '@mui/material';
import { IMAGES_ICON } from '../../assets/images/exportImages';

const Input = styled('input')({
    display: 'none',
});

export default function DragDropUpload({ fileName, sendUploadFiles, labelName, multiFile = false, acceptFileType = '.pdf, image/*', error = false, errorMsg = '', labelHide = false }: any) {
    const refDocument = useRef() as MutableRefObject<HTMLInputElement>;
    const [_dragOver, _setDragOver] = useState(false);

    const handleDragOver = (e: any) => {
        e.preventDefault();
        _setDragOver(true);
    };

    const handleDragLeave = () => {
        _setDragOver(false);
    };

    const sendFiles = (files: any) => {
        if (files?.length) {
            sendUploadFiles(files)
        }
    }


    const handleDrop = (e: any) => {
        e.preventDefault();
        _setDragOver(false);

        const droppedImage = e.dataTransfer.files;
        if (droppedImage?.length) {
            sendFiles(droppedImage);
        }
    };

    // function for document upload
    const onUpload = (e: any) => {
        sendFiles(e.target.files);
        setTimeout(() => {
            refDocument.current.value = ''
        }, 1000);
    }

    return <React.Fragment>
        <div className="fs15">{!labelHide ? labelName : ''}</div>
        <div className={`cardBorder bg-light-field py-1 rounded row gx-0 align-items-center justify-content-between ${_dragOver ? 'drag-over' : ''} ${error ? 'redBorder' : ''}`} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
            <div className='col-md-9'>
                <div className="d-flex gap-3 align-items-center px-2">
                    {!fileName ?
                        <div className='text-muted text-truncate fs14'>{labelName}</div> :
                        <div className='text-muted text-truncate fs14'>{fileName}</div>
                    }
                </div>
            </div>
            <div className='col-md-3 text-end'>
                <Button className="transformNone fw400 text-dark" component="label" color="secondary">
                    <img className='filterPrimary' src={IMAGES_ICON?.UploadIcon} alt="Icon" />
                    <Input style={{ visibility: 'hidden' }} accept={acceptFileType} type="file" multiple={multiFile} ref={refDocument} onChange={onUpload} />
                </Button>
            </div>
        </div>
        {error && <div className="fs12 errorClr ms-3 mt-1">{errorMsg}</div>}

    </React.Fragment>
}