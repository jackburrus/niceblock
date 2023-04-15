import { useMutation } from "react-query";

const contractDetailsPrompt = `I'm going to provide you with Ethereum Solidity contract sources code and a contract. You are going to analyze the code and return the following Javascript object:

{
    readableName: string,
    description: string,
    emoji: string,
    usefulMethod: string,
    gasOptimizationScore: string,
}


For readable name, i'd like you to analyze the contract and give me the name of the Main contract in the contract source code. Try to use the contract that is most related to the Contract name. If there are multiple contracts with the same inheritance, use the contract that has the most functions or just default to the contract name if you are not sure.

For description, i'd like you to analyze the contract and give me a short description of what the contract does. Use no more than 10 words.

For emoji, i'd like you to analyze the contract and give me an emoji that best represents the contract. You can use any emoji you want, but please use only one. If you decide you're not able to find an emoji, just use the default emoji of a contract (📜).

For interesting methods, i'd like you to analyze the contract and give me the most interesting function that you think are worth looking at. You can use any function you want. If you decide you're not able to find any interesting functions, you can just give an empty array.

For gas optimization score, i'd like you to analyze the contract and give me a score from 0 to 10. 0 means the contract is not optimized at all and 10 means the contract is fully optimized. You can use any score you want, but please use only one. If you decide you're not able to find a score, you can just give a score of N/A.

Ensure you have both opening and closing brackets.

Here is the contract:
`;

export const getContractDetails = async (
  query: string,
  contractName: string,
  setReadableContractDetails: () => void,
) => {
  try {
    const response = await fetch("/api/response", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: contractDetailsPrompt + query + "Here is the contract Name: " + contractName,
      }),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    return data;
  } catch (e) {
    console.log(e);
  }
};

export async function readStream(data: ReadableStream): Promise<string> {
  const reader = data.getReader();
  const decoder = new TextDecoder();
  let result = "";
  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunkValue = decoder.decode(value);
    result += chunkValue;
  }
  return result;
}

export function useCreateMutation(
  mutationFn: (
    contract: string,
    contractName: string,
    setReadableContractDetails: () => void,
  ) => Promise<ReadableStream<Uint8Array> | null | undefined>,
  onData: (result: any) => void, // Add a callback function for passing the awaited data
) {
  return useMutation(mutationFn, {
    onSuccess: async data => {
      if (!data) {
        return;
      }
      const result = await readStream(data);
      console.log(result);
      onData(result); // Call the onData callback with the result
    },
    onError: e => {
      if (e instanceof Error) {
        throw new Error(e.message || "Something went wrong!");
      }
    },
  });
}
