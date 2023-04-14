import { useQuery } from "react-query";

export const getSourceCode = async (address: string) => {
  try {
    const response = await fetch(
      `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${process.env.ETHERSCAN_API_KEY}`,
    );

    const { result } = await response.json();
    console.log(result, "res");
    return result[0].SourceCode;
  } catch (error) {
    console.error(`Error fetching contract source code for address ${address}: ${error}`);
    throw error;
  }
};

export const useEtherscanSourceCode = (address: string) => {
  return useQuery(["sourceCode", address], () => getSourceCode(address), {
    enabled: !!address,
    cacheTime: 1000 * 60 * 60 * 24, // 1 day
  });
};
