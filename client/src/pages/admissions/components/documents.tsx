import { useEffect, useRef, useState } from "react";
import { useStateValue } from "../../../providers/StateProvider";
import { CustomAlert } from "../../../services/HelperService";
import { CustomAutoSelect } from "../../../components/helpers/CustomSelect";
import { Button, styled, TextField, Typography, Box, IconButton } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import { commonUploadFile, getCandidateDocument, insertUpdateCandidateDocuments } from "../../../models";
import { ROUTES } from "../../../configs/constants";
import { Upload, Eye, PlusCircle, MinusCircle } from "lucide-react";
import FormField from "../../../components/shared/FormField";
import DialogModal from "../../../components/shared/DialogModal";
import { gray } from "../../../theme/tokens";

const Input = styled("input")({ display: "none" });

export default function Documents({ handleBack, handleNext }: any) {
  const [{ admissionDetails }]: any = useStateValue();
  const refDocuments = useRef<Array<HTMLInputElement | null>>([]);
  const [_loading, _setLoading] = useState(false);
  const [_previewImage, _setPreviewImage] = useState("");
  const [_documentList, _setDocumentList] = useState<any>([]);
  const [_confirmDelete, _setConfirmDelete] = useState<{ open: boolean; index: number | null }>({ open: false, index: null });

  const changeDocumentList = (index: number, key: string, value: any) => {
    const _tempArr = [..._documentList];
    _tempArr[index][key] = value;
    _setDocumentList([..._tempArr]);
  };

  const handleDocumentNumberChange = (index: number, value: string) => {
    const document = _documentList[index];
    const documentType = document?.documentName;
    let processedValue = value.toUpperCase();
    if (documentType === "Aadhaar") {
      processedValue = value.replace(/\D/g, '').slice(0, 12);
    } else if (documentType === "Passport") {
      processedValue = value.replace(/[^A-Z0-9]/gi, '').slice(0, 8);
    }
    changeDocumentList(index, "documentNumber", processedValue);
  };

  const addMoreDocuments = () => {
    _setDocumentList([
      ..._documentList,
      {
        id: 0, admissionRefId: admissionDetails?.admissionDetails?.id || 0,
        candidateRefId: admissionDetails?.admissionDetails?.candidateRefId || 0,
        documentName: "", documentNumber: "", documentUrl: "", isActive: true,
      },
    ]);
  };

  const onUpload = async (files: any, index: number) => {
    _setLoading(true);
    const formData = new FormData();
    formData.append("file", files[0]);
    await commonUploadFile(formData)
      .then((response) => {
        if (response.status === 200) {
          changeDocumentList(index, "documentUrl", response?.data?.file);
          refDocuments.current.forEach((input) => { if (input && input.type === "file") input.value = ""; });
          refDocuments.current = [];
        }
      })
      .catch((error) => console.log(error.response))
      .finally(() => _setLoading(false));
  };

  const handlePreviewUpload = (item: any) => {
    if (item?.documentUrl) _setPreviewImage(item.documentUrl);
    else CustomAlert("warning", "No document/image uploaded to preview.");
  };

  const handleSubmitForm = () => {
    if (!_documentList?.length) { CustomAlert("warning", "Document required"); return; }
    if (_documentList?.length) {
      let valid = true;
      _documentList?.filter((doc: any) => doc.isActive !== false)?.forEach((element: any) => {
        if (!element?.documentName || !element?.documentNumber || !element?.documentUrl) { valid = false; return; }
      });
      if (!valid) { CustomAlert("warning", "Document list missing some fields or has invalid format"); return; }
    }
    _setLoading(true);
    insertUpdateCandidateDocuments({ documents: _documentList })
      .then((resp) => { if (resp?.data?.status === "success") { CustomAlert("success", "Documents details saved"); handleNext(); } })
      .catch(console.log)
      .finally(() => _setLoading(false));
  };

  const getDocumentDetails = () => {
    getCandidateDocument(admissionDetails?.admissionDetails?.candidateRefId)
      .then((resp) => {
        if (resp?.data?.status === "success") {
          if (!resp?.data?.result?.length) addMoreDocuments();
          else _setDocumentList([...resp?.data?.result]);
        }
      })
      .catch(console.log);
  };

  useEffect(() => { getDocumentDetails(); }, []);
  useEffect(() => {
    if (_documentList.filter((doc: any) => doc.isActive !== false).length === 0) addMoreDocuments();
  }, [_documentList]);

  const handleRemoveDocument = (index: number) => { _setConfirmDelete({ open: true, index }); };

  const confirmRemoveDocument = () => {
    if (_confirmDelete.index !== null) {
      const index = _confirmDelete.index;
      const _tempArr = [..._documentList];
      if (_tempArr.at(index)?.id) _tempArr[index].isActive = false;
      else _tempArr.splice(index, 1);
      _setDocumentList([..._tempArr]);
    }
    _setConfirmDelete({ open: false, index: null });
  };

  return (
    <>
      <Box>
        <Typography sx={{ fontWeight: 600, mb: 2 }}>Document Details</Typography>

        <Grid2 container spacing={3} sx={{ mb: 1 }}>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 500, color: gray[700] }}>Document Type *</Typography>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 500, color: gray[700] }}>Document Number *</Typography>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 500, color: gray[700] }}>Upload Document *</Typography>
          </Grid2>
        </Grid2>

        {_documentList?.filter((doc: any) => doc.isActive !== false)
          .map((mItem: any, idx: number, arr: any[]) => {
            const isLast = idx === arr.length - 1;
            const mIndex = _documentList.findIndex((d: any) => d === mItem);
            return (
              <Grid2 container spacing={3} key={mIndex} sx={{ alignItems: 'center', mb: 1 }}>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <CustomAutoSelect
                    value={mItem?.documentName}
                    onChange={(value: any) => changeDocumentList(mIndex, "documentName", value || "")}
                    placeholder="Document type"
                    menuItem={["Aadhaar", "Passport"]?.map((item: any) => ({ title: item, value: item }))} />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <TextField fullWidth size="small"
                    value={mItem?.documentNumber}
                    onChange={(e: any) => handleDocumentNumberChange(mIndex, e.target.value)}
                    placeholder={mItem?.documentName === "Aadhaar" ? "12 digits only" : mItem?.documentName === "Passport" ? "8 alphanumeric" : "Document number"} />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: `1px solid ${gray[300]}`, borderRadius: 1, px: 1.5, py: 0.75 }}>
                    <Typography variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: mItem?.documentUrl ? 'text.primary' : gray[400], fontSize: '14px' }}>
                      {mItem?.documentUrl || "Upload Document"}
                    </Typography>
                    {mItem?.documentUrl?.length > 0 && (
                      <IconButton size="small" onClick={(e: any) => { e.stopPropagation(); handlePreviewUpload(mItem); }}>
                        <Eye size={16} color={gray[500]} />
                      </IconButton>
                    )}
                    <IconButton size="small" onClick={() => refDocuments.current[mIndex]?.click()}>
                      <Upload size={16} color={gray[500]} />
                    </IconButton>
                    <Input style={{ visibility: "hidden", position: 'absolute' }} accept="image/*" type="file"
                      ref={(el) => (refDocuments.current[mIndex] = el)} onChange={(e: any) => onUpload(e.target.files, mIndex)} />
                  </Box>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {_documentList?.filter((doc: any) => doc.isActive !== false)?.length > 0 && (
                      <IconButton size="small" onClick={() => handleRemoveDocument(mIndex)}>
                        <MinusCircle size={20} color={gray[500]} />
                      </IconButton>
                    )}
                    {isLast && (
                      <IconButton size="small" color="primary" onClick={addMoreDocuments}>
                        <PlusCircle size={20} />
                      </IconButton>
                    )}
                  </Box>
                </Grid2>
              </Grid2>
            );
          })}

        {_documentList.filter((doc: any) => doc.isActive !== false).length === 0 && (
          <Box sx={{ mt: 2 }}>
            <IconButton size="small" color="primary" onClick={addMoreDocuments}>
              <PlusCircle size={20} />
            </IconButton>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button variant="outlined" disabled={_loading} onClick={handleBack}
            sx={{ textTransform: 'none', px: 4, color: 'black', borderColor: gray[300] }}>Back</Button>
          <Button variant="contained" color="primary" disabled={_loading} onClick={handleSubmitForm}
            sx={{ textTransform: 'none', px: 4 }}>Next</Button>
        </Box>
      </Box>

      <DialogModal open={!!_previewImage} onClose={() => _setPreviewImage("")} title="Document Preview" maxWidth="md">
        {_previewImage ? (
          _previewImage.match(/\.(pdf)$/i) ? (
            <iframe src={ROUTES.API.DOWNLOAD_FILE + _previewImage} title="PDF Preview" width="100%" height="500px" style={{ border: 0 }} />
          ) : (
            <img src={ROUTES.API.DOWNLOAD_FILE + _previewImage} alt="Image Preview" draggable={false}
              style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }}
              onError={(e) => (e.currentTarget.style.display = "none")} />
          )
        ) : (
          <Typography variant="body2" sx={{ textAlign: 'center', color: gray[500] }}>No preview available</Typography>
        )}
      </DialogModal>

      <DialogModal open={_confirmDelete.open} onClose={() => _setConfirmDelete({ open: false, index: null })}
        title="Delete Document" maxWidth="xs"
        actions={
          <>
            <Button variant="outlined" onClick={() => _setConfirmDelete({ open: false, index: null })}
              sx={{ textTransform: 'none', color: 'black', borderColor: gray[300] }}>Cancel</Button>
            <Button variant="contained" color="error" onClick={confirmRemoveDocument}
              sx={{ textTransform: 'none' }}>Delete</Button>
          </>
        }>
        <Typography variant="body2">Are you sure you want to delete this document?</Typography>
      </DialogModal>
    </>
  );
}
