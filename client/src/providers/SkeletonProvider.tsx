import { memo } from 'react';
import { Skeleton, TableCell, TableRow } from "@mui/material";

interface propsTable {
    height?: number;
    items?: number;
    columns?: number;
    visible?: boolean;
}

interface propsText {
    visible?: boolean;
}

export const SkeletonProviderTables = memo(({ columns = 1, visible = true }: propsTable) => {
    const skeletons: any = Array.from(Array(columns).keys());

    if (!visible) {
        return null;
    }

    return (
        <TableRow>
            {skeletons.map((item: number) => <TableCell key={item} align={"center"}><Skeleton /></TableCell>)}
        </TableRow>
    );
});

export const SkeletonProviderText = memo(({ visible = true }: propsText) => {
    if (!visible) {
        return null;
    }

    return <Skeleton width={100} />;
});

export const SkeletonProviderItems = memo(({ items = 1, visible = true, height = 100 }: propsTable) => {
    const skeletons: any = Array.from(Array(items).keys());

    if (!visible) {
        return null;
    }

    return <div className="row justify-content-center col-md-10 mx-auto">{skeletons?.map((item: number) =>
        <div className="col-md-3 text-center p-3">
            <Skeleton variant={"rectangular"} height={height} className="rounded-3" key={item} />
        </div>
    )}
    </div>
});

export const SkeletonProviderImages = memo(({ visible = true }: propsText) => {
    if (!visible) {
        return null;
    }

    return (<div className="d-flex flex-wrap">
        <Skeleton variant={"rectangular"} width={60} height={60} className="m-2 rounded-3" />
        <Skeleton variant={"rectangular"} width={60} height={60} className="m-2 rounded-3" />
        <Skeleton variant={"rectangular"} width={60} height={60} className="m-2 rounded-3" />
        <Skeleton variant={"rectangular"} width={60} height={60} className="m-2 rounded-3" />
        <Skeleton variant={"rectangular"} width={60} height={60} className="m-2 rounded-3" />
    </div>);
});

export const SkeletonService = memo(({ items = 4, visible = true }: propsTable) => {
    if (!visible) {
        return null;
    }
    const skeletons: any = Array.from(Array(items).keys());

    return <>
        {skeletons.map((item: number) => <div key={item} className='col-md-3'>
            <div className="bg-white p-2">
                <Skeleton className='mt-3' variant={"circular"} width={30} height={30} />
                <div className="fw500 py-2">Service {item}</div>
                <Skeleton className='mb-1' variant="text" sx={{ fontSize: '12px' }} />
                <Skeleton className='mb-1' width="90%" variant="text" sx={{ fontSize: '12px' }} />
                <Skeleton className='mb-1' width="80%" variant="text" sx={{ fontSize: '12px' }} />
            </div>
        </div>)}
    </>
})

export const SkeletonPage = memo(({ items = 1, visible = true, height = 320 }: propsTable) => {
    if (!visible) {
        return null;
    }
    const skeletons: any = Array.from(Array(items).keys());

    return <>
        <div className="row justify-content-center">
            {skeletons.map((item: number) =>
                <div className="col-12 my-2 position-relative" key={item}>
                    <Skeleton variant={"rectangular"} height={height} className="m-2 rounded" />
                    <Skeleton variant={"rectangular"} height={20} className="m-2 rounded" />
                    <Skeleton variant={"rectangular"} height={20} className="m-2 rounded" />
                </div>)
            }
        </div>
    </>
});

export const SkeletonDetailsImages = memo(({ visible = true }: propsTable) => {
    if (!visible) {
        return null;
    }
    return <>
        <div className="row px-2">
            <div className="col-md-7 mx-auto position-relative p-1">
                <Skeleton variant={"rectangular"} height={408} className="rounded10" />
            </div>
            <div className="col-md-5 mx-auto">
                <div className="row">
                    <div className="col-md-6 p-1">
                        <Skeleton variant={"rectangular"} height={200} className="rounded10" />
                    </div>
                    <div className="col-md-6 p-1">
                        <Skeleton variant={"rectangular"} height={200} className="rounded10" />
                    </div>
                    <div className="col-md-6 p-1">
                        <Skeleton variant={"rectangular"} height={200} className="rounded10" />
                    </div>
                    <div className="col-md-6 p-1">
                        <Skeleton variant={"rectangular"} height={200} className="rounded10" />
                    </div>
                </div>
            </div>
        </div>
    </>
});

export const SkeletonProviderBusinessDays = memo(({ visible = true }: propsText) => {
    if (!visible) {
        return null;
    }

    return (<>
        <BusinessDaysSkeleton />
        <BusinessDaysSkeleton />
        <BusinessDaysSkeleton />
        <BusinessDaysSkeleton />
        <BusinessDaysSkeleton />
        <BusinessDaysSkeleton />
        <BusinessDaysSkeleton />
    </>);
});

export const SkeletonProviderService = memo(({ visible = true }: propsText) => {
    if (!visible) {
        return null;
    }

    return (<>
        <ServiceSkeleton />
        <ServiceSkeleton />
        <ServiceSkeleton />
        <ServiceSkeleton />
        <ServiceSkeleton />
    </>);
});

const ServiceSkeleton = () => {
    return (<div className="col-md-4 mb-3">
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
            <div className="d-flex justify-content-start align-items-center">
                <Skeleton variant={"circular"} width={60} height={60} />
                <span className="px-2"><Skeleton width={200} /></span>
            </div>
            <div>
                <Skeleton variant={"circular"} width={20} height={20} />
            </div>
        </div>
    </div>)
}

const BusinessDaysSkeleton = () => {
    return (<div className="row">
        <div className="col-md-3 mb-3"><Skeleton /></div>
        <div className="col-md-5 mb-3 pb-2 border-bottom">
            <div className="row">
                <div className="col-6"><Skeleton /></div>
                <div className="col-6"><Skeleton /></div>
            </div>
        </div>
    </div>)
}