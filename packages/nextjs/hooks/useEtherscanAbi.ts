import { useQuery } from "react-query";

export const getContractAbi = async (address: string) => {
  try {
    const response = await fetch(
      `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${process.env.ETHERSCAN_API_KEY}`,
    );
    const { result } = await response.json();
    return result;
  } catch (error) {
    console.error(`Error fetching contract ABI for address ${address}: ${error}`);
    throw error;
  }
};

export const useEtherscanAbi = (address: string) => {
  return useQuery(["abi", address], () => getContractAbi(address), {
    enabled: !!address,
    cacheTime: 1000 * 60 * 60 * 24, // 1 day
  });
};
