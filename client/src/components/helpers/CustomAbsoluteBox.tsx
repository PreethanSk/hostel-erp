import { useRef, useEffect } from "react";

export const CustomAbsoluteBox = ({ children, onClose }: any) => {
    const boxRef: any = useRef(null);
    const handleClick = (event: any) => {
        if (boxRef?.current && !boxRef?.current?.contains(event.target)) {
            onClose();
        }
    };
    useEffect(() => {
        document.addEventListener('mousedown', handleClick);

        return () => {
            document.removeEventListener('mousedown', handleClick);
        };
    }, [onClose]);

    return <div ref={boxRef}>{children}</div>;
};