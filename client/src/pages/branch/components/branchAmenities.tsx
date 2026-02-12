import { useEffect, useState } from "react";
import { Button, Checkbox, FormControlLabel } from "@mui/material";
import { IMAGES_ICON } from "../../../assets/images/exportImages";
import { CustomAlert } from "../../../services/HelperService";
import {
  getBranchAmenitiesList,
  getMasterAmenitiesCategory,
  getMasterAmenitiesSubCategory,
  insertUpdateBranchAmenities,
} from "../../../models";

type Props = {
  branch: any;
  readOnly?: boolean;
};

type Category = {
  id: number;
  name: string;
};

type SubCategory = {
  id: number;
  name: string;
  categoryId: number;
};

type BranchAmenityRow = {
  id?: number;
  branchId: number;
  categoryId: number;
  subCategoryId: string; // comma separated ids
  isActive?: boolean;
  description?: string;
};

export default function BranchAmenities({ branch, readOnly }: Props) {
  const [_categories, _setCategories] = useState<Category[]>([]);
  const [_subCategories, _setSubCategories] = useState<SubCategory[]>([]);
  const [_amenities, _setAmenities] = useState<BranchAmenityRow[]>([]);
  const [_selected, _setSelected] = useState<Record<number, Set<number>>>({});
  const [_loading, _setLoading] = useState(false);

  useEffect(() => {
    loadMasters();
  }, []);

  useEffect(() => {
    if (!branch?.id) {
      _setAmenities([]);
      _setSelected({});
      return;
    }
    loadBranchAmenities();
  }, [branch?.id, _categories.length, _subCategories.length]);

  const loadMasters = () => {
    getMasterAmenitiesCategory()
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          _setCategories(resp?.data?.result || []);
        }
      })
      .catch(console.log);

    getMasterAmenitiesSubCategory()
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          _setSubCategories(resp?.data?.result || []);
        }
      })
      .catch(console.log);
  };

  const loadBranchAmenities = () => {
    if (!branch?.id) return;
    getBranchAmenitiesList(branch.id)
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          const rows = resp?.data?.result || [];
          _setAmenities(rows);

          const selectedMap: Record<number, Set<number>> = {};
          rows.forEach((row: any) => {
            const catId = Number(row?.categoryId);
            if (!catId) return;
            const ids = (row?.subCategoryId || "")
              .split(",")
              .map((v: string) => Number(v))
              .filter((v: number) => !!v);
            selectedMap[catId] = new Set(ids);
          });
          _setSelected(selectedMap);
        }
      })
      .catch((err: any) => {
        console.log(err);
        CustomAlert("warning", "Unable to load amenities");
      });
  };

  const toggleSubCategory = (categoryId: number, subCategoryId: number) => {
    if (readOnly) return;
    const current = new Set(_selected[categoryId] || []);
    if (current.has(subCategoryId)) {
      current.delete(subCategoryId);
    } else {
      current.add(subCategoryId);
    }
    _setSelected({
      ..._selected,
      [categoryId]: current,
    });
  };

  const saveAmenities = () => {
    if (readOnly || !branch?.id) return;
    const amenitiesPayload: BranchAmenityRow[] = [];

    _categories.forEach((cat) => {
      const idsSet = _selected[cat.id] || new Set<number>();
      const idsArray = Array.from(idsSet);
      const existingRow = _amenities.find((a) => Number(a.categoryId) === Number(cat.id));

      amenitiesPayload.push({
        id: existingRow?.id || 0,
        branchId: branch.id,
        categoryId: cat.id,
        subCategoryId: idsArray.join(","),
        isActive: idsArray.length > 0,
        description: existingRow?.description || "",
      });
    });

    if (!amenitiesPayload.length) {
      CustomAlert("warning", "Nothing to save");
      return;
    }

    _setLoading(true);
    insertUpdateBranchAmenities({ amenities: amenitiesPayload })
      .then((resp: any) => {
        if (resp?.data?.status === "success") {
          CustomAlert("success", "Amenities updated successfully");
          loadBranchAmenities();
        } else {
          CustomAlert("warning", resp?.data?.error || "Failed to update amenities");
        }
      })
      .catch((err: any) => {
        console.log(err);
        CustomAlert("warning", "Failed to update amenities");
      })
      .finally(() => _setLoading(false));
  };

  const getSubCategoriesByCategory = (categoryId: number) => {
    return _subCategories.filter((s) => Number(s.categoryId) === Number(categoryId));
  };

  return (
    <div className="bg-field-gray border rounded px-3 py-2">
      <div className="d-flex align-items-center justify-content-between borderBottomLight pb-2 mb-2">
        <div className="fw-bold">Branch Amenities</div>
        {!readOnly && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            className="text-capitalize"
            disabled={_loading || !branch?.id}
            startIcon={<img height={16} draggable={false} src={IMAGES_ICON.TableNewItemIcon} />}
            onClick={saveAmenities}
          >
            Save
          </Button>
        )}
      </div>

      {!branch?.id ? (
        <div className="text-muted text-center py-4">
          Please create or select a branch first.
        </div>
      ) : _categories?.length ? (
        <div className="amenities-list">
          {_categories.map((cat) => {
            const subList = getSubCategoriesByCategory(cat.id);
            if (!subList.length) return null;
            const selectedSet = _selected[cat.id] || new Set<number>();
            return (
              <div key={cat.id} className="mb-3 border rounded bg-white">
                <div className="px-3 py-2 borderBottomLight d-flex align-items-center justify-content-between">
                  <div className="fw-bold fs14">{cat.name}</div>
                  <div className="fs12 text-muted">
                    {selectedSet.size
                      ? `${selectedSet.size} selected`
                      : "No amenities selected"}
                  </div>
                </div>
                <div className="px-3 py-2">
                  <div className="row">
                    {subList.map((sub) => (
                      <div key={sub.id} className="col-12 col-md-6 col-lg-4 mb-1">
                        <FormControlLabel
                          label={sub.name}
                          control={
                            <Checkbox
                              checked={selectedSet.has(sub.id)}
                              onChange={() => toggleSubCategory(cat.id, sub.id)}
                              disabled={readOnly}
                            />
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-muted text-center py-4">
          No amenities master data found. Please configure amenities masters first.
        </div>
      )}
    </div>
  );
}

