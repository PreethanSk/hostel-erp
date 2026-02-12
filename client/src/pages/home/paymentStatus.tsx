import { useEffect, useState } from "react"
import { base64, CustomAlert } from "../../services/HelperService";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../configs/constants";
import { updatePaymentStatus } from "../../models";

export default function PaymentStatus() {
    const navigate = useNavigate()
    const [_loading, _setLoading] = useState(false)
    const [_paymentDetails, _setPaymentDetails] = useState<any>({});

    const handleUpdateStatus = (request: any) => {
        _setLoading(true)
        updatePaymentStatus({ admissionId: request?.udf4, candidateId: request?.udf5, paidAmount: request?.txnAmount })
            .then((resp) => {
                if (resp?.data?.status === "success") {
                    CustomAlert('success', 'Status Updated')
                } else {
                    CustomAlert('success', resp?.data?.error)
                }
            })
            .catch(console.log)
            .finally(() => _setLoading(false))
    }

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const endPoint = queryParams.get('endPoint');
        if (endPoint) {
            try {
                const endPointData = JSON.parse(base64.decode(endPoint));
                console.log(endPointData)
                _setPaymentDetails(endPointData)
                if (endPointData?.paymentStatus === "SUCCESS") {
                    handleUpdateStatus(endPointData)
                }
            } catch (error) {
                _setPaymentDetails({ paymentStatus: 'FAILED' })
            }
        } else {
            _setPaymentDetails({ paymentStatus: 'FAILED' })
        }
    }, [])
    return <>
        <div className="shadow p-3 rounded bg-light border" style={{ maxWidth: "500px", margin: "50px auto", }}>
            {_paymentDetails?.paymentStatus === "SUCCESS" ? (
                <>
                    <div className="fs-4 pb-3 text-success text-center">Payment Successful!</div>
                    <div className="row my-2 justify-content-around">
                        <div className="col-md-4 my-1 fw-bold">Transaction ID</div>
                        <div className="col-md-6 my-1">: {_paymentDetails?.getepayTxnId}</div>
                        <div className="col-md-4 my-1 fw-bold">Merchant ID</div>
                        <div className="col-md-6 my-1">: {_paymentDetails?.merchantOrderNo}</div>
                        <div className="col-md-4 my-1 fw-bold">Amount Paid</div>
                        <div className="col-md-6 my-1">: ₹ {_paymentDetails?.txnAmount}</div>
                        <div className="col-md-4 my-1 fw-bold">Date</div>
                        <div className="col-md-6 my-1">: {_paymentDetails?.txnDate}</div>
                        <div className="col-md-4 my-1 fw-bold">Payment Mode</div>
                        <div className="col-md-6 my-1">: {_paymentDetails?.paymentMode}</div>
                    </div>
                </>
            ) : (
                <>
                    <div className="fs-4 pb-3 text-danger text-center">Payment Failed</div>
                    <div className="row my-2 justify-content-around">
                        <div className="col-md-4 my-1 fw-bold">Transaction ID</div>
                        <div className="col-md-8 my-1">: {_paymentDetails?.getepayTxnId}</div>
                        <div className="col-md-4 my-1 fw-bold">Status</div>
                        <div className="col-md-8 my-1">: ₹{_paymentDetails?.paymentStatus}</div>
                        <div className="col-md-4 my-1 fw-bold">Message</div>
                        <div className="col-md-8 my-1">: {_paymentDetails?.message || "No specific reason provided"}</div>
                    </div>
                </>
            )}
            <div className="text-center mt-4">
                <Button size="small" className="px-3" variant="contained" disabled={_loading} onClick={() => navigate(ROUTES.HOME.ADMISSION.CONFIRMATION)}>Continue</Button>
            </div>
        </div>
    </>
}
