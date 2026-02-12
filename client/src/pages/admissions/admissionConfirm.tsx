import { useEffect, useState } from "react";
import { Button, Step, StepLabel, Stepper } from "@mui/material";
import { KeyboardArrowRightRounded } from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";
import { CustomAlert } from "../../services/HelperService";
import {
  getCandidateAdmissionById,
  getCandidateContactPerson,
  getCandidateDetail,
  getCandidateDocument,
  getCandidateOtherDetail,
  getCandidatePaymentDetail,
  getCandidatePurposeOfStay,
  insertUpdateCandidateAdmission,
  insertUpdateCandidateContactPerson,
  insertUpdateCandidateDetails,
  insertUpdateCandidateDocuments,
  insertUpdateCandidateOtherDetail,
  insertUpdateCandidatePaymentDetail,
  insertUpdateCandidatePurposeOfStay,
} from "../../models";
import CandidateDetails from "./components/candidateDetails";
import ContactPerson from "./components/contactPerson";
import Documents from "./components/documents";
import PurposeOfStay from "./components/purposeOfStay";
import RoomAndFee from "./components/roomAndFee";
import Payments from "./components/payments";
import Others from "./components/others";

type Props = {
  PageAccess: string;
};

const steps = [
  "Candidate Details",
  "Contact Person",
  "Documents",
  "Purpose Of Stay",
  "Room & Fee",
  "Payments",
  "Others",
];

export default function AdmissionConfirmation({ PageAccess }: Props) {
  const [searchParams] = useSearchParams();
  const [_activeStep, _setActiveStep] = useState(0);
  const [_loading, _setLoading] = useState(false);

  const candidateIdParam = searchParams.get("candidateId");
  const branchIdParam = searchParams.get("branchId");
  const admissionIdParam = searchParams.get("admissionId");
  const cotIdParam = searchParams.get("cotId");

  const [_candidate, _setCandidate] = useState<any>({});
  const [_contact, _setContact] = useState<any>({});
  const [_documents, _setDocuments] = useState<any[]>([]);
  const [_purpose, _setPurpose] = useState<any>({});
  const [_admission, _setAdmission] = useState<any>({});
  const [_payment, _setPayment] = useState<any>({});
  const [_others, _setOthers] = useState<any>({});

  const readOnly = PageAccess === "ReadOnly";

  const candidateId = Number(candidateIdParam || 0) || undefined;
  const branchId = Number(branchIdParam || 0) || undefined;
  const admissionId = Number(admissionIdParam || 0) || undefined;
  const cotId = Number(cotIdParam || 0) || undefined;

  useEffect(() => {
    const loadInitial = async () => {
      try {
        _setLoading(true);

        if (candidateId) {
          const [cd, cp, docs, pos, other, pay] = await Promise.all([
            getCandidateDetail(candidateId),
            getCandidateContactPerson(candidateId),
            getCandidateDocument(candidateId),
            getCandidatePurposeOfStay(candidateId),
            getCandidateOtherDetail(candidateId),
            getCandidatePaymentDetail(candidateId),
          ]);

          if (cd?.data?.status === "success") {
            _setCandidate(cd?.data?.result || {});
          }
          if (cp?.data?.status === "success") {
            _setContact(cp?.data?.result || {});
          }
          if (docs?.data?.status === "success") {
            _setDocuments(docs?.data?.result || []);
          }
          if (pos?.data?.status === "success") {
            _setPurpose(pos?.data?.result || {});
          }
          if (other?.data?.status === "success") {
            _setOthers(other?.data?.result || {});
          }
          if (pay?.data?.status === "success") {
            _setPayment(pay?.data?.result || {});
          }
        }

        if (candidateId || branchId || admissionId || cotId) {
          const resp = await getCandidateAdmissionById({
            candidateId,
            branchId,
            admissionId,
            cotId,
          });
          if (resp?.data?.status === "success") {
            const result = resp?.data?.result || {};
            _setAdmission({
              id: result?.id,
              candidateRefId: result?.candidateRefId || candidateId,
              branchRefId: result?.branchRefId || branchId,
              roomRefId: result?.roomRefId,
              cotRefId: result?.cotRefId || cotId,
              dateOfAdmission: result?.dateOfAdmission,
              admissionFee: result?.admissionFee,
              advancePaid: result?.advancePaid,
              monthlyRent: result?.monthlyRent,
              lateFeeAmount: result?.lateFeeAmount,
              admissionStatus: result?.admissionStatus || "Inprogress",
            });
          }
        }
      } catch (err) {
        console.log(err);
      } finally {
        _setLoading(false);
      }
    };

    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveStep = async () => {
    if (readOnly) {
      _setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
      return;
    }

    try {
      _setLoading(true);
      if (_activeStep === 0) {
        const body = {
          ..._candidate,
          id: _candidate?.id || 0,
        };
        const resp = await insertUpdateCandidateDetails(body);
        if (resp?.data?.status === "success") {
          const insertedId = resp?.data?.result?.insertedId;
          if (insertedId && !candidateId) {
            _setCandidate({ ..._candidate, id: insertedId });
          }
          CustomAlert("success", resp?.data?.result?.message || "Candidate saved");
        } else {
          CustomAlert("warning", resp?.data?.error || "Unable to save candidate");
          return;
        }
      } else if (_activeStep === 1) {
        const body = {
          ..._contact,
          id: _contact?.id || 0,
          candidateRefId: _candidate?.id || candidateId,
          admissionRefId: _admission?.id || admissionId || 0,
        };
        const resp = await insertUpdateCandidateContactPerson(body);
        if (resp?.data?.status !== "success") {
          CustomAlert("warning", resp?.data?.error || "Unable to save contact person");
          return;
        }
      } else if (_activeStep === 2) {
        const docs = (_documents || []).map((d) => ({
          ...d,
          candidateRefId: d.candidateRefId || _candidate?.id || candidateId,
        }));
        if (docs.length) {
          const resp = await insertUpdateCandidateDocuments({ documents: docs });
          if (resp?.data?.status !== "success") {
            CustomAlert("warning", resp?.data?.error || "Unable to save documents");
            return;
          }
        }
      } else if (_activeStep === 3) {
        const body = {
          ..._purpose,
          id: _purpose?.id || 0,
          candidateRefId: _candidate?.id || candidateId,
          admissionRefId: _admission?.id || admissionId || 0,
        };
        const resp = await insertUpdateCandidatePurposeOfStay(body);
        if (resp?.data?.status !== "success") {
          CustomAlert("warning", resp?.data?.error || "Unable to save purpose of stay");
          return;
        }
      } else if (_activeStep === 4) {
        const body = {
          ..._admission,
          id: _admission?.id || admissionId || 0,
          candidateRefId: _candidate?.id || candidateId,
          branchRefId: _admission?.branchRefId || branchId,
        };
        const resp = await insertUpdateCandidateAdmission(body);
        if (resp?.data?.status === "success") {
          const insertedId = resp?.data?.result?.insertedId;
          if (insertedId && !_admission?.id) {
            _setAdmission({ ..._admission, id: insertedId });
          }
        } else {
          CustomAlert("warning", resp?.data?.error || "Unable to save admission");
          return;
        }
      } else if (_activeStep === 5) {
        const body = {
          ..._payment,
          id: _payment?.id || 0,
          candidateRefId: _candidate?.id || candidateId,
          admissionRefId: _admission?.id || admissionId || 0,
        };
        const resp = await insertUpdateCandidatePaymentDetail(body);
        if (resp?.data?.status !== "success") {
          CustomAlert("warning", resp?.data?.error || "Unable to save payments");
          return;
        }
      } else if (_activeStep === 6) {
        const body = {
          ..._others,
          id: _others?.id || 0,
          candidateRefId: _candidate?.id || candidateId,
          admissionRefId: _admission?.id || admissionId || 0,
        };
        const resp = await insertUpdateCandidateOtherDetail(body);
        if (resp?.data?.status !== "success") {
          CustomAlert("warning", resp?.data?.error || "Unable to save others");
          return;
        }
        CustomAlert("success", "Admission saved successfully");
      }

      _setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    } catch (err) {
      console.log(err);
      CustomAlert("warning", "Unable to save admission");
    } finally {
      _setLoading(false);
    }
  };

  const handleBack = () => {
    _setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="container-fluid py-3">
      <div className="container">
        <div className="row justify-content-between align-items-center py-3">
          <div className="col-md-6 my-2">
            <div className="d-flex align-items-center gap-2 mobJustify">
              <span className="text-dark fw-bold">Admission </span>
              <span className="text-dark">
                <KeyboardArrowRightRounded />
              </span>
              <span className="text-muted">Admission Confirmation</span>
            </div>
          </div>
        </div>

        <div className="bg-field-gray border rounded px-3 py-3">
          <Stepper activeStep={_activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <div className="mt-4">
            {_activeStep === 0 && (
              <CandidateDetails
                formData={_candidate}
                onChange={(k, v) => _setCandidate({ ..._candidate, [k]: v })}
                readOnly={readOnly}
              />
            )}
            {_activeStep === 1 && (
              <ContactPerson
                formData={_contact}
                onChange={(k, v) => _setContact({ ..._contact, [k]: v })}
                readOnly={readOnly}
              />
            )}
            {_activeStep === 2 && (
              <Documents
                documents={_documents}
                onChange={_setDocuments}
                readOnly={readOnly}
                candidateId={_candidate?.id || candidateId}
              />
            )}
            {_activeStep === 3 && (
              <PurposeOfStay
                formData={_purpose}
                onChange={(k, v) => _setPurpose({ ..._purpose, [k]: v })}
                readOnly={readOnly}
              />
            )}
            {_activeStep === 4 && (
              <RoomAndFee
                formData={_admission}
                onChange={(k, v) => _setAdmission({ ..._admission, [k]: v })}
                readOnly={readOnly}
              />
            )}
            {_activeStep === 5 && (
              <Payments
                formData={_payment}
                onChange={(k, v) => _setPayment({ ..._payment, [k]: v })}
                readOnly={readOnly}
              />
            )}
            {_activeStep === 6 && (
              <Others
                formData={_others}
                onChange={(k, v) => _setOthers({ ..._others, [k]: v })}
                readOnly={readOnly}
              />
            )}
          </div>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <Button
              className="text-capitalize bg-white"
              variant="outlined"
              disabled={_activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={_loading}
              className="text-capitalize"
              onClick={handleSaveStep}
            >
              {_activeStep === steps.length - 1 ? "Finish" : "Save & Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

