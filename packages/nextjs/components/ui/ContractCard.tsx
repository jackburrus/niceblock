import { truncateAddress } from "~~/utils/helpers";

export default function ContractCard({
  contract,
  setSelectedContract,
}: {
  contract: string;
  setSelectedContract: (contract: string) => void;
}) {
  return (
    <div onClick={() => setSelectedContract(contract)} className=" w-full h-36 rounded-md  border shadow-md">
      <h1>{truncateAddress(contract)}</h1>
    </div>
  );
}
