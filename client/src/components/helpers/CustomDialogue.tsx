import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { IMAGES_ICON } from "../../assets/images/exportImages";

export default function CustomDialogue({ displaySize = 'sm', title, dialogueFlag, mainContent, actionContent, onCloseClick, fullScreen = false, }: any) {

    return <Dialog fullScreen={fullScreen} fullWidth maxWidth={displaySize} open={dialogueFlag} onClose={onCloseClick} disableEscapeKeyDown={true}>
        <DialogTitle className={`px-0 ${title ? '' : 'pb-0'}`}>
            <div className="d-flex justify-content-between align-items-center px-4">
                <span className="fw-bold">{title}</span>
                <img src={IMAGES_ICON.CloseIcon} alt="" height={30} role="button" onClick={onCloseClick} />
            </div>
        </DialogTitle>
        <DialogContent className="px-4">{mainContent}</DialogContent>
        <DialogActions className="">{actionContent}</DialogActions>
    </Dialog>
}
export function CustomSimpleDialogue({ displaySize = 'sm', dialogueFlag, mainContent, onCloseClick, fullScreen = false, }: any) {

    return <Dialog fullScreen={fullScreen} fullWidth maxWidth={displaySize} open={dialogueFlag} onClose={onCloseClick} disableEscapeKeyDown={true}>
        <DialogContent className="p-0" style={{ overflow: "hidden" }}>{mainContent}</DialogContent>
    </Dialog>
}
