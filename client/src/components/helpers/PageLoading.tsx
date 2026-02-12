import { Skeleton } from '@mui/material'

export default function PageLoading() {
    return <>
        <div className="position-relative">
            <div className="bg-white position-absolute w-100" style={{ padding: "130px", zIndex: "-1" }}></div>
        </div>
        <div className="">
            <Skeleton variant="rectangular"  height={660} />
        </div>
    </>
}
