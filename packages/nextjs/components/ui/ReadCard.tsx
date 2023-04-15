import { useState } from "react";
import { AbiFunction } from "../../pages/index";
import { displayTxResult } from "../scaffold-eth";
import { useContractRead } from "wagmi";

export default function ReadCard({ func, abi, contract }: { func: AbiFunction; abi: any; contract: string }) {
  const [readSelected, setReadSelected] = useState(false);

  const { data: contractData, error } = useContractRead({
    chainId: 1,
    abi,
    address: contract,
    functionName: func.name,
    args: func.inputs.map(input => input.name),
    enabled: readSelected,
  });

  return (
    <div className="py-4 border border-green-500 flex flex-row justify-between">
      <h1>{func.name}</h1>
      <button
        onClick={() => {
          setReadSelected(true);
        }}
      >
        Read
      </button>
      {displayTxResult(contractData)}
    </div>
  );
}
