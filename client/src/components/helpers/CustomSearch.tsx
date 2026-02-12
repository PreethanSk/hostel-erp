import { TextField } from "@mui/material";
import { IMAGES_ICON } from "../../assets/images/exportImages";
import { CustomAbsoluteBox } from "./CustomAbsoluteBox";
import { useEffect, useState } from "react";

export default function CustomSearch({ getSearchText }: any) {
  const [_popup, _setPopup] = useState(false);
  const [_search, _setSearch] = useState("");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getSearchText(_search);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [_search]);

  return (
    <>
      <span className="position-relative">
        <img
          height={24}
          src={IMAGES_ICON.TableSearchIcon}
          role="button"
          onClick={() => _setPopup(true)}
          draggable="false"
        />
        {_search ? (
          <span
            title="Clear"
            className="text-danger position-absolute"
            role="button"
            onClick={() => _setSearch("")}
          >
            *
          </span>
        ) : (
          ""
        )}
      </span>
      {_popup && (
        <CustomAbsoluteBox onClose={() => _setPopup(false)}>
          <div className="position-relative">
            <div
              className="position-absolute bg-white shadow rounded"
              style={{
                zIndex: "9999",
                width: "200px",
                top: "6px",
                right: "0px",
                overflowY: "auto",
                maxHeight: "200px",
              }}
            >
              <div className="p-2 bg-gray d-flex align-items-center">
                <TextField
                  size="small"
                  fullWidth
                  className="bg-white py-0"
                  autoComplete="off"
                  value={_search}
                  onChange={(e: any) => _setSearch(e.target.value)}
                  placeholder="Search"
                  InputProps={{
                    endAdornment: (
                      <img
                        height={18}
                        src={IMAGES_ICON.TableSearchIcon}
                        role="button"
                        draggable="false"
                      />
                    ),
                  }}
                />
              </div>
            </div>
          </div>
        </CustomAbsoluteBox>
      )}
    </>
  );
}
