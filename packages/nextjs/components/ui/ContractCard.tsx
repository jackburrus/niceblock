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
      <div onClick={() => setSelectedContract(contract)} className="  h-36 rounded-md  border shadow-md">
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
    <div onClick={() => setSelectedContract(contract)} className="  h-36 rounded-md  border shadow-md">
      <p>{selectedContractDetails["emoji"]}</p>
      <h1>{selectedContractDetails["readableName"]}</h1>
      <p>{selectedContractDetails["description"]}</p>
    </div>
  );
}
