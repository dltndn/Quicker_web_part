import { KaikasConnect } from "../../utils/KaikasConnect";
import { useState, useEffect } from "react";
import { generateQRCode } from "../../utils/GenerateQr";
import { SendTxType, SendTxDelegationType } from "../../utils/KaikasConnect";
import { useConnWalletInfo } from "../../App";
import Modal from "./QrModal";
import { SendTxKStyle } from "../../StyleCollection";

const {LoadButton} = new SendTxKStyle()

type SendTokenProps = {
  param: SendTxType | SendTxDelegationType;
  successFunc: () => void;
};

const SendTxK = ({ param, successFunc }: SendTokenProps) => {

  const [showQr, setShowQr] = useState<boolean>(false);
  const [qrUrl, setQrUrl] = useState<string>("");

  const { isMobile } = useConnWalletInfo();

  const kConn = new KaikasConnect();

  const mobileConnect = async () => {
    const reqKey = await kConn.getKaikasReqKeyTx(param);
    try {
      // @ts-ignore
      if (param.fee_delegated) {
        await kConn.getTxResultFeeDeligation(reqKey, true)
      } else {
        await kConn.getTxResult(reqKey, true);
      }
      successFunc();
    } catch (e) {
      console.log(e);
    }
  };

  const qrConnect = async () => {
    const reqKey = await kConn.getKaikasReqKeyTx(param);
    const qrUrlStr = await generateQRCode(`https://app.kaikas.io/a/${reqKey}`);
    setQrUrl(qrUrlStr);
    setShowQr(true);
    try {
      // @ts-ignore
      if (param.fee_delegated) {
        await kConn.getTxResultFeeDeligation(reqKey, false)
      } else {
        await kConn.getTxResult(reqKey, false);
      }
      setShowQr(false);
      setQrUrl("");
      successFunc();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    return () => {
      setShowQr(false);
      setQrUrl("");
    };
  }, []);

  return (
    <>
      {isMobile === null ? (<>로그아웃 상태입니다</>):(
        <>
          {isMobile ? (
            <LoadButton onClick={mobileConnect}>블록체인 지갑으로 이동</LoadButton>
          ) : (
            <>
            <LoadButton onClick={qrConnect}>블록체인 지갑으로 이동</LoadButton>

            {showQr && (
        
            <Modal isOpen={showQr} onClose={() => setShowQr(false)} imageUrl={qrUrl} />
          )}

              
            </>
          )}
        </>
      )}
    </>
  );
};

export default SendTxK;
