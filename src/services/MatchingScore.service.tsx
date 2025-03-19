import { MatchScore } from "@Pages/request-referral/RequestReferral";
import httpServiceObj from "./ApiHandler.service";
import { set } from "react-hook-form";
import { FeedbackModalProps } from "@Components/Shared/Feedback";

export const MatchingScore = async (
    referralRequestId: string,
    email: string,
    setLoader: (value: boolean) => void,
    setMessageEnabled: (value: boolean) => void,
    setModalType: (
      value:
        | "zeroReferral"
        | "profileCompletion"
        | "AlreadyRequested"
        | "RequestAccepted"
        | "RequestRejected"
        | "Error_250"
        | "Error_251"
        | "Max_tries"
    ) => void,
    setGaugeEnabled: (value: boolean) => void,
    setGaugeScore: (value: number) => void,
    setFeedbackInfo: (value: FeedbackModalProps) => void,
    setIsFeedbackOpen: (value: boolean) => void,
    updateExternalJobApplication?: () => void,
    isJobMode?: boolean
  ) => {
    const isJobModeValue = isJobMode ?? false;
    let attempts = 0;
    const maxRetries = 5;
    const intervalTime = 20000; // 20 seconds
  
    const fetchScore = async () => {
      if (attempts >= maxRetries) {
        setGaugeEnabled(false)
        setLoader(false);
        setMessageEnabled(true);
        setModalType("Max_tries");
        return;
      }
  
      try {
        const { response, error } = await httpServiceObj.get<MatchScore>(
          `/user/${email}/referral/${referralRequestId}/score`,
          true
        );
  
        if (error) {
          setGaugeEnabled(false)
          setLoader(false);
          setMessageEnabled(true);
          setModalType("Max_tries");
          return;
        }

        if(response?.matchingScore! >= 0 && response?.rejectionFeedbackBySystem){
            setLoader(false);
            setMessageEnabled(true);
            setModalType("RequestRejected");
            setGaugeEnabled(true);
            setGaugeScore(response.matchingScore);
            setFeedbackInfo({
                title : 'Rejection Feedback',
                details : response.rejectionFeedbackBySystem,
                onClose() {
                    setIsFeedbackOpen(true);
                },
            });
            return;
        }

        //  Handle different cases
        switch (response?.jdMatchErrorCode) {
        case 200:
            setLoader(false);
            setMessageEnabled(true);
            setModalType("RequestAccepted");
            if(updateExternalJobApplication )updateExternalJobApplication();
            setGaugeEnabled(true);
            setGaugeScore(response.matchingScore);
            return;

          case 250:
            setGaugeEnabled(false)
            setLoader(false);
            setMessageEnabled(true);
            setModalType("Error_250");
            return;
  
          case 251:
            setGaugeEnabled(false)
            setLoader(false);
            setMessageEnabled(true);
            setModalType("Error_251");
            return;
  
          default:
            /*  if (response?.matchingScore > 0) {
              setLoader(false);
              setMessageEnabled(true);
              setModalType("RequestAccepted");
              setGaugeEnabled(true);
              setGaugeScore(response.matchingScore);
              return; //  Stop polling since we got a valid score
            } */ 
        }
      } catch (err: any) {
        setLoader(false);
        setMessageEnabled(true);
        setModalType("Max_tries");
        return;
      }
  
      attempts++;
  
      //  If score is still 0, retry after 20 seconds
      setTimeout(fetchScore, intervalTime);
    };
  
    //  Call API immediately on the first run
    await fetchScore();
  };
  
  
  