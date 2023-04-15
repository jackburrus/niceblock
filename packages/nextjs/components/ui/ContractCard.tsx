import { truncateAddress } from "~~/utils/helpers";

export default function ContractCard({
  contract,
  setSelectedContract,
  selectedContractDetails,
  status,
}: {
  contract: string;
  setSelectedContract: (contract: string) => void;
  selectedContractDetails: any;
  status: string;
}) {
  if (status === "loading")
    return (
      <div
        onClick={() => setSelectedContract(contract)}
        className="text-[#93A3B8] w-full p-4 h-auto rounded-md bg-[#111A2E] border shadow-md border-[#516175]"
      >
        <h1>Loading...</h1>
      </div>
    );

  if (!selectedContractDetails)
    return (
      <div onClick={() => setSelectedContract(contract)} className="  h-36 rounded-md  border shadow-md">
        <h1>{truncateAddress(contract)}</h1>
      </div>
    );
  return (
    <div
      onClick={() => setSelectedContract(contract)}
      className="text-[#93A3B8] w-full p-4 h-auto rounded-md bg-[#111A2E] border shadow-md border-[#516175]"
    >
      <div className="text-4xl flex flex-row items-center">
        <p className="text-4xl mr-6">{selectedContractDetails["emoji"]}</p>
        <h1>{selectedContractDetails["readableName"]}</h1>
      </div>

      <p>{selectedContractDetails["description"]}</p>
      <p>Useful Function: {selectedContractDetails["usefulMethod"]}</p>
    </div>
  );
}
