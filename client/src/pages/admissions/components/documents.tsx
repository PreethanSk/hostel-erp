import { Button, Table, TableBody, TableCell, TableHead, TableRow, TextField } from "@mui/material";
import { IMAGES_ICON } from "../../../assets/images/exportImages";
import { textFieldStyle } from "../../../services/HelperService";

type DocumentItem = {
  id?: number;
  candidateRefId?: number;
  documentType?: string;
  documentNumber?: string;
  documentUrl?: string;
};

type Props = {
  documents: DocumentItem[];
  onChange: (docs: DocumentItem[]) => void;
  readOnly?: boolean;
  candidateId?: number;
};

export default function Documents({ documents, onChange, readOnly, candidateId }: Props) {
  const handleAdd = () => {
    if (readOnly) return;
    const next: DocumentItem[] = [
      ...documents,
      { id: 0, candidateRefId: candidateId, documentType: "", documentNumber: "", documentUrl: "" },
    ];
    onChange(next);
  };

  const handleChange = (index: number, key: keyof DocumentItem, value: any) => {
    const next = [...documents];
    next[index] = { ...next[index], [key]: value };
    if (candidateId && !next[index].candidateRefId) {
      next[index].candidateRefId = candidateId;
    }
    onChange(next);
  };

  const handleRemove = (index: number) => {
    if (readOnly) return;
    const next = [...documents];
    next.splice(index, 1);
    onChange(next);
  };

  return (
    <div>
      {!readOnly && (
        <div className="d-flex justify-content-end mb-2">
          <Button
            className="text-capitalize"
            sx={{ color: "black" }}
            startIcon={<img height={18} src={IMAGES_ICON.TableNewItemIcon} draggable={false} />}
            onClick={handleAdd}
          >
            Add Document
          </Button>
        </div>
      )}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell className="fw-bold">S.No</TableCell>
            <TableCell className="fw-bold">Document Type</TableCell>
            <TableCell className="fw-bold">Document Number</TableCell>
            <TableCell className="fw-bold">Document URL</TableCell>
            {!readOnly && <TableCell className="fw-bold">Action</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {documents?.length ? (
            documents.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    sx={{ ...textFieldStyle }}
                    value={item.documentType || ""}
                    onChange={(e) => handleChange(index, "documentType", e.target.value)}
                    InputProps={{ readOnly }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    sx={{ ...textFieldStyle }}
                    value={item.documentNumber || ""}
                    onChange={(e) => handleChange(index, "documentNumber", e.target.value)}
                    InputProps={{ readOnly }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    sx={{ ...textFieldStyle }}
                    value={item.documentUrl || ""}
                    onChange={(e) => handleChange(index, "documentUrl", e.target.value)}
                    InputProps={{ readOnly }}
                  />
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <img
                      height={16}
                      src={IMAGES_ICON.DeleteIcon}
                      alt="delete"
                      draggable={false}
                      role="button"
                      onClick={() => handleRemove(index)}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={readOnly ? 4 : 5} align="center" className="text-muted">
                No documents added
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

