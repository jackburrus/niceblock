import { useQuery } from "react-query";

const getContractAbi = async (address: string) => {
  const response = await fetch(
    `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${process.env.ETHERSCAN_API_KEY}`,
  );
  const { result } = await response.json();
  return JSON.parse(result);
};

export const useEtherscanAbi = (address: string) => {
  return useQuery(["abi", address], () => getContractAbi(address), {
    enabled: !!address,
  });
};
