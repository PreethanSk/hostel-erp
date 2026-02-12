import { LockPersonRounded } from "@mui/icons-material";

export default function NoAccess() {
    return <div className="text-center my-5 no-select">
        <div className="mb-3 text-muted"><LockPersonRounded style={{ fontSize: "10rem" }} /></div>
        <div className="mb-3 text-muted fw-bold fs-5">You don't have permission to view this page</div>
    </div>
}
