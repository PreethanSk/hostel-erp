import { ChangeEvent, useEffect, useState } from "react";
import { Button, Grid } from "@mui/material";
import { IMAGES_ICON } from "../../../assets/images/exportImages";
import { ROUTES } from "../../../configs/constants";
import { CustomAlert } from "../../../services/HelperService";
import { commonUploadFile, getBranchPhotosList, insertUpdateBranchPhotos } from "../../../models";

type Props = {
  branch: any;
  onUpdated?: (branch: any | null) => void;
  readOnly?: boolean;
};

type BranchPhoto = {
  id?: number;
  branchId: number;
  photoUrl: string;
  isActive: boolean;
};

export default function BranchPhotos({ branch, onUpdated, readOnly }: Props) {
  const [_photos, _setPhotos] = useState<BranchPhoto[]>([]);
  const [_uploading, _setUploading] = useState(false);

  useEffect(() => {
    if (!branch?.id) {
      _setPhotos([]);
      return;
    }
    loadPhotos();
  }, [branch?.id]);

  const loadPhotos = () => {
    if (!branch?.id) return;
    getBranchPhotosList(branch.id)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          _setPhotos(resp?.data?.result || []);
        }
      })
      .catch((err: any) => {
        console.log(err);
        CustomAlert("warning", "Unable to load photos");
      });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (readOnly || !branch?.id) return;
    const files = e.target.files;
    if (!files || !files.length) return;

    _setUploading(true);
    const newPhotos: BranchPhoto[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const resp: any = await commonUploadFile(formData);
        if (resp?.data?.file) {
          newPhotos.push({
            id: 0,
            branchId: branch.id,
            photoUrl: resp.data.file,
            isActive: true,
          });
        }
      }

      if (newPhotos.length) {
        const payload = {
          photos: [
            ..._photos.map((p: any) => ({
              id: p?.id,
              branchId: branch.id,
              photoUrl: p?.photoUrl,
              isActive: p?.isActive ?? true,
            })),
            ...newPhotos,
          ],
        };

        insertUpdateBranchPhotos(payload)
          .then((resp: any) => {
            if (resp?.data?.status === "success") {
              CustomAlert("success", "Photos updated successfully");
              loadPhotos();
              onUpdated && onUpdated(null);
            } else {
              CustomAlert("warning", resp?.data?.error || "Failed to update photos");
            }
          })
          .catch((err: any) => {
            console.log(err);
            CustomAlert("warning", "Failed to update photos");
          })
          .finally(() => _setUploading(false));
      } else {
        _setUploading(false);
      }
    } catch (error) {
      console.log(error);
      CustomAlert("warning", "Failed to upload photos");
      _setUploading(false);
    } finally {
      e.target.value = "";
    }
  };

  const togglePhotoActive = (photo: BranchPhoto) => {
    if (readOnly) return;
    const updated = _photos.map((p) =>
      p.id === photo.id ? { ...p, isActive: !p.isActive } : p
    );
    _setPhotos(updated);
  };

  const savePhotos = () => {
    if (readOnly || !branch?.id) return;
    const payload = {
      photos: _photos.map((p: any) => ({
        id: p?.id,
        branchId: branch.id,
        photoUrl: p?.photoUrl,
        isActive: p?.isActive ?? true,
      })),
    };

    insertUpdateBranchPhotos(payload)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          CustomAlert("success", "Photos updated successfully");
          loadPhotos();
          onUpdated && onUpdated(null);
        } else {
          CustomAlert("warning", resp?.data?.error || "Failed to update photos");
        }
      })
      .catch((err: any) => {
        console.log(err);
        CustomAlert("warning", "Failed to update photos");
      });
  };

  return (
    <div className="bg-field-gray border rounded px-3 py-2">
      <div className="d-flex align-items-center justify-content-between borderBottomLight pb-2 mb-2">
        <div className="fw-bold">Branch Photos</div>
        <div className="d-flex align-items-center gap-2">
          {!readOnly && (
            <>
              <label className="btn btn-light btn-sm text-capitalize mb-0">
                <img
                  height={18}
                  draggable={false}
                  src={IMAGES_ICON.TableNewItemIcon}
                  alt="icon"
                  className="me-1"
                />
                Upload
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleFileChange}
                  disabled={_uploading || !branch?.id}
                />
              </label>
              <Button
                size="small"
                variant="contained"
                color="primary"
                className="text-capitalize"
                disabled={_uploading || !branch?.id}
                onClick={savePhotos}
              >
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {!branch?.id ? (
        <div className="text-muted text-center py-4">
          Please create or select a branch first.
        </div>
      ) : _photos?.length ? (
        <Grid container spacing={2}>
          {_photos.map((photo: any) => (
            <Grid item xs={6} md={4} key={photo?.id || photo?.photoUrl}>
              <div className="border rounded bg-white overflow-hidden h-100 d-flex flex-column">
                <div className="ratio ratio-4x3 bg-light">
                  <img
                    src={ROUTES.API.DOWNLOAD_FILE + photo?.photoUrl}
                    alt="Branch"
                    className="w-100 h-100 object-fit-cover"
                    draggable={false}
                  />
                </div>
                <div className="px-2 py-1 d-flex align-items-center justify-content-between">
                  <div className="fs12 text-muted text-truncate">
                    {photo?.photoUrl?.split("/")?.pop()}
                  </div>
                  {!readOnly && (
                    <div
                      className="fs12"
                      role="button"
                      onClick={() => togglePhotoActive(photo)}
                    >
                      {photo?.isActive ? (
                        <span className="statusBgActive text-success rounded--50 px-2 py-1">
                          Active
                        </span>
                      ) : (
                        <span className="statusBgInactive text-danger rounded--50 px-2 py-1">
                          Inactive
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Grid>
          ))}
        </Grid>
      ) : (
        <div className="text-muted text-center py-4">
          No photos uploaded for this branch yet.
        </div>
      )}
    </div>
  );
}

