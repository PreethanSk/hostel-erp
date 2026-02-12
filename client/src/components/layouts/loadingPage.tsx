import { IMAGES_ICON } from '../../assets/images/exportImages'

export default function LoadingPage() {
    return <div className="vh-100 vw-100 position-absolute top-0 d-flex flex-column align-items-center justify-content-center" style={{ background: "#000000b0", left: "0px", zIndex: 99999 }}>
        <div className="text-center">
            <img loading='lazy' className="bg-primary p-2 rounded" height={34} src={IMAGES_ICON.LoadingGif} alt="" draggable /></div>
        <div className="pt-2 text-white fs14">Loading...</div>
    </div>
}
