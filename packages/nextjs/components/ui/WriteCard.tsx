import { useState } from "react";
import PencilIcon from "../PencilIcon";
import { displayTxResult } from "../scaffold-eth";
import { useContractWrite } from "wagmi";
import { AbiFunction } from "~~/pages";

export default function WriteCard({ func, abi, contract }: { func: AbiFunction; abi: any; contract: string }) {
  const [writeSelected, setWriteSelected] = useState(false);
  const [inputValues, setInputValues] = useState<any>({
    // [input.name]: "",
  });
  const {
    data: contractData,
    error,
    writeAsync,
  } = useContractWrite({
    chainId: 1,
    abi,
    address: contract,
    functionName: func.name,
    args: Object.values(inputValues),
  });

  return (
    <div className="py-4 border-b border-[#516175] shadow-md my-2  w-auto flex flex-row justify-between items-center">
      <h1 className="max-w-[250px] truncate">{func.name}</h1>

      <div className="flex flex-col">
        {func.inputs.map(input => {
          return (
            <input
              className="text-[#93A3B8] mb-1 flex-1 pl-2 bg-[#111A2E] py-1  placeholder-[#93A3B8]"
              name={input.name}
              placeholder={input.type}
              key={input.name}
              onChange={e => {
                setInputValues({ ...inputValues, [input.name]: e.target.value });
              }}
            />
          );
        })}
      </div>

      {contractData && writeSelected ? (
        <div onClick={() => setWriteSelected(false)} className="bg-[#283758] rounded w-auto py-3 px-2">
          {displayTxResult(contractData)}
        </div>
      ) : (
        <div
          onClick={() => {
            setWriteSelected(true);
          }}
          className="bg-[#283758] rounded w-auto py-3 px-2"
        >
          <PencilIcon />
        </div>
      )}
    </div>
  );
}
