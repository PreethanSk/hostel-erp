import { useEffect, useRef, useState } from "react";
import { useStateValue } from "../../../providers/StateProvider";
import { CustomAlert, textFieldStyle } from "../../../services/HelperService";
import { CustomAutoSelect } from "../../../components/helpers/CustomSelect";
import { Button, styled, TextField } from "@mui/material";
import { commonUploadFile, getCandidateDocument, insertUpdateCandidateDocuments, } from "../../../models";
import { IMAGES_ICON } from "../../../assets/images/exportImages";
import CustomDialogue from "../../../components/helpers/CustomDialogue";
import { ROUTES } from "../../../configs/constants";

const Input = styled("input")({ display: "none" });

export default function Documents({ handleBack, handleNext }: any) {
  const [{ admissionDetails }]: any = useStateValue();
  const refDocuments = useRef<Array<HTMLInputElement | null>>([]);
  const [_loading, _setLoading] = useState(false);
  const [_previewImage, _setPreviewImage] = useState("");
  const [_documentList, _setDocumentList] = useState<any>([]);
  const [_confirmDelete, _setConfirmDelete] = useState<{
    open: boolean;
    index: number | null;
  }>({ open: false, index: null });

  const changeDocumentList = (index: number, key: string, value: any) => {
    const _tempArr = [..._documentList];
    _tempArr[index][key] = value;
    _setDocumentList([..._tempArr]);
  };

  // Validation functions for document numbers
  // const validateAadhaar = (value: string) => {
  //   // Aadhaar should be exactly 12 digits
  //   const aadhaarRegex = /^\d{12}$/;
  //   return aadhaarRegex.test(value);
  // };

  // const validatePassport = (value: string) => {
  //   // Passport should be exactly 8 alphanumeric characters
  //   const passportRegex = /^[A-Z0-9]{8}$/;
  //   return passportRegex.test(value);
  // };

  const handleDocumentNumberChange = (index: number, value: string) => {
    const document = _documentList[index];
    const documentType = document?.documentName;
    let processedValue = value.toUpperCase();

    if (documentType === "Aadhaar") {
      // For Aadhaar, only allow digits and limit to 12 characters
      processedValue = value.replace(/\D/g, '').slice(0, 12);
    } else if (documentType === "Passport") {
      // For Passport, only allow alphanumeric and limit to 8 characters
      processedValue = value.replace(/[^A-Z0-9]/gi, '').slice(0, 8);
    }

    changeDocumentList(index, "documentNumber", processedValue);
  };

  const validate = {
    documentName: { error: false, message: "" },
    documentNumber: { error: false, message: "" },
    documentUrl: { error: false, message: "" },
  };

  const [_validate, _setValidate] = useState(validate);

  const addMoreDocuments = () => {
    _setDocumentList([
      ..._documentList,
      {
        id: 0,
        admissionRefId: admissionDetails?.admissionDetails?.id || 0,
        candidateRefId: admissionDetails?.admissionDetails?.candidateRefId || 0,
        documentName: "",
        documentNumber: "",
        documentUrl: "",
        isActive: true,
      },
    ]);
  };

  // const removeDocuments = (index: number) => {
  //   const _tempArr = [..._documentList];
  //   if (_tempArr.at(index)?.id) {
  //     _tempArr[index].isActive = false;
  //   } else {
  //     _tempArr.splice(index, 1);
  //   }
  //   _setDocumentList(_tempArr);
  // };

  const onUpload = async (files: any, index: number) => {
    _setLoading(true);
    const formData = new FormData();
    formData.append("file", files[0]);
    await commonUploadFile(formData)
      .then((response) => {
        if (response.status === 200) {
          changeDocumentList(index, "documentUrl", response?.data?.file);
          refDocuments.current.forEach((input) => {
            if (input && input.type === "file") {
              input.value = "";
            }
          });
          refDocuments.current = [];
        }
      })
      .catch((error) => {
        console.log(error.response);
      })
      .finally(() => _setLoading(false));
  };

  const handlePreviewUpload = (item: any) => {
    if (item?.documentUrl) {
      _setPreviewImage(item.documentUrl);
    } else {
      CustomAlert("warning", "No document/image uploaded to preview.");
    }
  };
  const handleSubmitForm = () => {
    if (!_documentList?.length) {
      CustomAlert("warning", "Document requried")
      return
    }
    if (_documentList?.length) {
      let valid = true;
      _documentList?.filter((doc: any) => doc.isActive !== false)?.forEach((element: any) => {
        if (!element?.documentName) {
          valid = false
          return;
        }
        if (!element?.documentNumber) {
          valid = false
          return;
        }
        if (!element?.documentUrl) {
          valid = false
          return;
        }

        // // Validate document number format based on document type
        // if (element?.documentName === "Aadhaar" && !validateAadhaar(element?.documentNumber)) {
        //   CustomAlert("warning", "Aadhaar number must be exactly 12 digits");
        //   valid = false
        //   return;
        // }
        // if (element?.documentName === "Passport" && !validatePassport(element?.documentNumber)) {
        //   CustomAlert("warning", "Passport number must be exactly 8 alphanumeric characters");
        //   valid = false
        //   return;
        // }
      });
      if (!valid) {
        CustomAlert("warning", "Document list missing some fields or has invalid format")
        return
      }
    }
    _setLoading(true);
    const body = { documents: _documentList };
    insertUpdateCandidateDocuments(body)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          CustomAlert("success", "Documents details saved");
          handleNext();
        }
      })
      .catch(console.log)
      .finally(() => _setLoading(false));
  };

  const getDocumentDetails = () => {
    getCandidateDocument(admissionDetails?.admissionDetails?.candidateRefId)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          if (!resp?.data?.result?.length) {
            addMoreDocuments();
          } else {
            _setDocumentList([...resp?.data?.result]);
          }
        }
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getDocumentDetails();
  }, []);


  useEffect(() => {
    if (_documentList.filter((doc: any) => doc.isActive !== false).length === 0) {
      addMoreDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_documentList]);

  const handleRemoveDocument = (index: number) => {
    _setConfirmDelete({ open: true, index });
  };

  const confirmRemoveDocument = () => {
    if (_confirmDelete.index !== null) {
      const index = _confirmDelete.index;
      const _tempArr = [..._documentList];
      if (_tempArr.at(index)?.id) {
        _tempArr[index].isActive = false;
      } else {
        _tempArr.splice(index, 1);
      }
      _setDocumentList([..._tempArr]);
    }
    _setConfirmDelete({ open: false, index: null });
  };

  const cancelRemoveDocument = () => {
    _setConfirmDelete({ open: false, index: null });
  };

  return (
    <>
      <div className="">
        <div className="row">
          <div className="fw-bold">Document Details</div>
          <div className="col-md-3 mt-4">
            <div className="text-muted fs14 mb-1 required">Document Type</div>
          </div>
          <div className="col-md-3 mt-4">
            <div className="text-muted fs14 mb-1 required">Document Number</div>
          </div>
          <div className="col-md-4 mt-4">
            <div className="text-muted fs14 mb-1 required">Upload Document</div>
          </div>
        </div>
        {_documentList?.filter((doc: any) => doc.isActive !== false)
          .map((mItem: any, idx: number, arr: any[]) => {
            const isLast = idx === arr.length - 1;
            const mIndex = _documentList.findIndex((d: any) => d === mItem);
            return (
              <div key={mIndex} className="row align-items-center">
                <div className="col-md-3 my-3">
                  <CustomAutoSelect
                    value={mItem?.documentName}
                    error={_validate.documentName.error}
                    helperText={_validate.documentName.message}
                    onChange={(value: any) => {
                      changeDocumentList(mIndex, "documentName", value || "");
                    }}
                    placeholder={"Document type"}
                    menuItem={["Aadhaar", "Passport"]?.map((item: any) => {
                      return { title: item, value: item };
                    })}
                  />
                </div>
                <div className="col-md-3 my-3">
                  <TextField
                    fullWidth
                    sx={{ ...textFieldStyle }}
                    value={mItem?.documentNumber}
                    onChange={(e: any) => handleDocumentNumberChange(mIndex, e.target.value)}
                    error={_validate.documentNumber.error}
                    helperText={_validate.documentNumber.message}
                    placeholder={mItem?.documentName === "Aadhaar" ? "12 digits only" : mItem?.documentName === "Passport" ? "8 alphanumeric" : "Document number"}
                  />
                </div>
                <div className="col-md-3 my-3">
                  <div className="customFieldBorder px-2 py-1">
                    <div className="d-flex justify-content-between align-items-center w-100">
                      <div className={`fs14 w-75 text-truncate ${mItem?.documentUrl ? "text-dark" : "text-muted"}`}>
                        {mItem?.documentUrl || "Upload Document"}
                      </div>
                      <div className="d-flex gap-2 align-items-center py-1">
                        {mItem?.documentUrl?.length > 0 && <img draggable={false} src={IMAGES_ICON.EyeIcon} alt="View" role="button" onClick={(e: any) => { e.stopPropagation(); handlePreviewUpload(mItem); }} />}
                        <img draggable={false} src={IMAGES_ICON.UploadIcon} alt="Upload" role="button" onClick={() => refDocuments.current[mIndex]?.click()} />
                      </div>
                    </div>
                    <Input style={{ visibility: "hidden" }} accept={"image/*"} type="file" ref={(el) => (refDocuments.current[mIndex] = el)} onChange={(e: any) => onUpload(e.target.files, mIndex)} />
                  </div>
                </div>
                <div className="col-md-3 my-3">
                  <div className="d-flex align-items-center gap-2">
                    {_documentList?.filter((doc: any) => doc.isActive !== false)?.length > 0 && (
                      <img draggable={false} src={IMAGES_ICON.RemoveIcon} alt="Remove" role="button" onClick={() => handleRemoveDocument(mIndex)} style={{ cursor: "pointer", filter: "grayscale(1)", opacity: 0.7, }} />
                    )}
                    {isLast && (
                      <img draggable={false} src={IMAGES_ICON.AddMoreIcon} alt="Add" role="button" onClick={addMoreDocuments} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        { }
        {_documentList.filter((doc: any) => doc.isActive !== false).length ===
          0 && (
            <div className="row align-items-center">
              <div className="col-md-3 my-3"></div>
              <div className="col-md-3 my-3"></div>
              <div className="col-md-3 my-3"></div>
              <div className="col-md-3 my-3">
                <div className="d-flex align-items-center gap-2">
                  <img draggable={false} src={IMAGES_ICON.AddMoreIcon} alt="Add" role="button" onClick={addMoreDocuments} />
                </div>
              </div>
            </div>
          )}
        <div className="mt-4 d-flex align-items-center justify-content-end mobJustify gap-3">
          <Button className="px-4 bg-white text-capitalize" variant="outlined" sx={{ color: "black" }} disabled={_loading} onClick={handleBack}>Back</Button>
          <Button className="px-4" variant="contained" color="primary" disabled={_loading} onClick={handleSubmitForm}>Next</Button>
        </div>
      </div>

      <CustomDialogue
        displaySize={"md"}
        title="Document Preview"
        dialogueFlag={!!_previewImage}
        onCloseClick={() => _setPreviewImage("")}
        mainContent={
          <div className="my-2">
            {_previewImage ? (
              _previewImage.match(/\.(pdf)$/i) ? (
                <iframe src={ROUTES.API.DOWNLOAD_FILE + _previewImage}
                  title="PDF Preview" width="100%" height="500px" style={{ border: 0 }} />
              ) : (
                <img src={ROUTES.API.DOWNLOAD_FILE + _previewImage}
                  alt="Image Preview" draggable="false" className="w-100" style={{ maxHeight: 400, objectFit: "contain" }}
                  onError={(e) => (e.currentTarget.style.display = "none")} />
              )
            ) : (
              <div className="text-center text-muted">No preview available</div>
            )}
          </div>
        }
      />

      <CustomDialogue
        displaySize={"xs"}
        title="Delete Document"
        dialogueFlag={_confirmDelete.open}
        onCloseClick={cancelRemoveDocument}
        mainContent={
          <div className="my-2">
            <div className="mb-3">
              Are you sure you want to delete this document?
            </div>
            <div className="d-flex justify-content-end gap-3">
              <Button variant="outlined" color="primary" className="px-4 py-1 text-dark" onClick={cancelRemoveDocument}>Cancel</Button>
              <Button variant="contained" color="error" className="px-4 py-1" onClick={confirmRemoveDocument}>Delete</Button>
            </div>
          </div>
        }
      />
    </>
  );
}
