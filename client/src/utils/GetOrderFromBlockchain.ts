import { readContract } from '@wagmi/core'
import { QUICKER_ADDRESS, QUICKER_CONTRACT_ABI } from '../contractInformation'
import { getDateFromTimestamp } from './ConvertTimestampToDate';
 
const Quicker_abi = QUICKER_CONTRACT_ABI;
const Quicker_address = QUICKER_ADDRESS;

export const getOrder = async(orderNum:string) => {
    const data = await readContract({
        address: Quicker_address,
        abi: Quicker_abi,
        functionName: "getOrder",
        args: [orderNum],
      })
      return TemplateOrder(data)
}

const TemplateOrder = (data: any) => {
    let obj = {orderNUm: BigInt(data[0]._hex).toString(),
    client: JSON.stringify(data[1]),
    quicker: JSON.stringify(data[2]),
    state: ConvertStateData(data[3]),
    orderPrice: ConvertCostData(data[4]),
    securityDeposit: ConvertCostData(data[5]),
    limitedTime: ConvertDateData(data[6]),
    createdTime: ConvertDateData(data[7]),
    matchedTime: ConvertDateData(data[8]),
    deliveredTime: ConvertDateData(data[9]),
    completedTime: ConvertDateData(data[10]),}
    return obj
  };
  
  const ConvertStateData = (state: number): string => {
    const stateArr = ["created", "matched", "completed", "failed", "canceled"];
  
    const result = stateArr[state];
    return result;
  };
  
  const ConvertCostData = (cost: any): string|null => {
    let result:string|null
    if (cost == 0) {
      result = null
    } else {
      result = BigInt(cost._hex).toString() + '원';
    }
    return result;
  };
  
  const ConvertDateData = (timestamp: any): object|null => {
    if (timestamp == 0) {
      return null
    } else {
      const { year, month, day, hours, minutes } = getDateFromTimestamp(timestamp)
      const result = {
        year,
        month,
        day,
        hours,
        minutes
      }
      return (result)
    }
  }