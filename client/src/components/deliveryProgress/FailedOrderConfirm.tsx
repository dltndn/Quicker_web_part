import { ExecutionComponentProps } from "../../pages/ExecutionPage"
import { useClientConfirmState } from "../../pages/ClientConfirmPage"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import ConfirmBtn from "../confirmBtn"
import { useOrderState } from "../ShowOrders"
import styled from "styled-components"
import SendTxK from "../blockChainTx/SendTxK"
import GetContractParams from "../blockChainTx/GetContractParams"

interface FailedOrderConfirmProps extends ExecutionComponentProps{
  isReceived: boolean;
}

export default function FailedOrderConfirm({ orderNum, isReceived }: FailedOrderConfirmProps) {
    const { setTitle } = useClientConfirmState()
    const { setReloadOrderNum } = useOrderState()
    const [base64String, setBase64String] = useState("");
    const [reason, setReason] = useState("");
    const [showTxBtn, setShowTxBtn] = useState<boolean>(false)
    const navigate = useNavigate()

    const confirmLogic = () => {
      if (isReceived) {
        navigate("/")
      } else {
        setShowTxBtn(true)
      }
    }

  const getImage = async () => {
    // 암호화
    // const { createHmac } = await import('node:crypto');

    // const secret = process.env.REACT_APP_CRYPTO_KEY;
    // let hashCode;
    // if (secret !== undefined && orderNum !== undefined) {
    //   hashCode = createHmac('sha256', secret).update(orderNum).digest('hex');
    // }

    // 배송시ㄹ패 사진 불러오기
    const response = await fetch(process.env.REACT_APP_SERVER_URL + `order/image/fail/?orderNum=${orderNum}`)
    const json = await response.json();
    const bufferImage = json.imageBuffer.data

    const base64Image = Buffer.from(bufferImage).toString('base64');

    // 이미지 src로 설정합니다.
    setBase64String(`data:image/png;base64, ${base64Image}`);
    setReason(json.reason)
  }

    useEffect(() => {
      (async()=> {
        setTitle("배송결과")
        await getImage()
      })()
      return () => {
        setReloadOrderNum(orderNum)
        setShowTxBtn(false)
      }
    }, [])
    
    return <>
        <Divv>
        <Div1>
          <Btwal>배송실패</Btwal>
        </Div1>
      </Divv>

        <Div0>
        <img src={base64String} alt="uploaded photo" width="100%" />
        </Div0>
        <Container>
          <Box>
            <div>
              <ReqFont>배송 실패 사유</ReqFont>
            </div> 
            {reason}실패 사유
          </Box>
        </Container>
        {!showTxBtn ? (<ConfirmBtn
            isDisabled={false}
            content={isReceived? ("확인"):("환불받기")}
            confirmLogic={confirmLogic}
          />):(<>{orderNum && (<Margin_1><SendTxK param={GetContractParams.FailedOrder(orderNum)} successFunc={() => navigate("/")}/></Margin_1>)}</>)}
        
    </>
}

const Div0 = styled.div`
    display: flex;
    justify-content: center;
`;

const Divv = styled.div`
    display: flex;
    height: 3.875rem;
`;

const Div1 = styled.div`
    flex: 1 1 100%;
`;

const Btwal = styled.button`
    width: 100%;
    height: 3.25rem;
    font-size: var(--font-md);
    font-weight: bold;
    border: 0rem;
    outline: #efefef;
    background-color: #ffffff;
    padding-left: 0.625rem;
    text-align: center;
    color: #FF5353;
`;

const Container = styled.section`
  width: 100%;
  bottom: 4.125rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Box = styled.div`
  border-radius: 0.313rem;
  margin-top: 0.5rem;
  width: 95%;
  background-color: #ffffff;
  padding: 0.75rem 1.125rem 0.75rem 1.125rem;
  text-align: center;
`;

const ReqFont = styled.span`
  font-size: 16px;
  font-weight: bold;
  margin-left: 0.313rem;
`;

const Margin_1 = styled.section`
  position: fixed;
  bottom: 0.5rem;
  width: 100%;
  display: flex;
  justify-content: center;
`