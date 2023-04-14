import { useEffect, useState } from "react";
import Head from "next/head";
import type { NextPage } from "next";
import { useForm } from "react-hook-form";
import { useAccount, useContractRead } from "wagmi";
import { useDeployedContractInfo, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { getContractAbi } from "~~/hooks/useEtherscanAbi";
import { getSourceCode } from "~~/hooks/useEtherscanSourceCode";

const Home: NextPage = () => {
  const { address } = useAccount();
  const { data: WatchListInfo } = useDeployedContractInfo("WatchList");
  const { register, handleSubmit } = useForm();

  const { data: userWatchList } = useContractRead({
    address: WatchListInfo?.address,
    abi: WatchListInfo?.abi,
    functionName: "getUserWatchList",
    watch: true,
  });

  const [selectedContract, setSelectedContract] = useState<string>("");
  const [readFunctions, setReadFunctions] = useState<AbiFunction[]>([]);
  const [writeFunctions, setWriteFunctions] = useState<AbiFunction[]>([]);
  const [sourceCode, setSourceCode] = useState<string>("");
  useEffect(() => {
    if (userWatchList?.length) {
      setSelectedContract(userWatchList?.[0]);
    }
  }, [userWatchList]);
  // const { data: abiData } = useEtherscanAbi(selectedContract);
  // const { data: sourceCode } = useEtherscanSourceCode(selectedContract);

  const { writeAsync } = useScaffoldContractWrite({
    contractName: "WatchList",
    functionName: "addToWatchList",
    args: [selectedContract?.replace(" ", "")],
  });

  const handleFetchData = async () => {
    // ABI Data
    const abiData = await getContractAbi(selectedContract);
    const { readableFunctions, writableFunctions } = splitAbiIntoReadWriteFunctions(JSON.parse(abiData));
    setReadFunctions(readableFunctions);
    setWriteFunctions(writableFunctions);

    // Source Code
    const sourceCode = await getSourceCode(selectedContract);
    setSourceCode(sourceCode);
  };
  useEffect(() => {
    if (selectedContract) {
      handleFetchData();
    }
  }, [selectedContract]);

  useEffect(() => {
    console.log(sourceCode);
  }, [sourceCode]);

  // useEffect(() => {
  //   if (abiData) {
  //     const { readableFunctions, writableFunctions } = splitAbiIntoReadWriteFunctions(JSON.parse(abiData));
  //     console.log(readableFunctions, writableFunctions);
  //     setReadFunctions(readableFunctions);
  //     setWriteFunctions(writableFunctions);
  //   }
  // }, [abiData, selectedContract]);

  const onSubmit = async () => {
    if (selectedContract && address) {
      await writeAsync();
    }
  };

  return (
    <>
      <Head>
        <title>Scaffold-eth App</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
      </Head>

      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 ">
          <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
            <input
              placeholder="Search for a contract"
              className="text-black"
              type="text"
              {...register("search", {
                required: true,
                onChange(event) {
                  setSelectedContract(event.target.value);
                },
              })}
            />
            <button type="submit">Submit</button>
            <span>0x9008D19f58AAbD9eD0D60971565AA8510560ab41</span>
          </form>
          <div className="flex flex-col">
            <h1>Watchlist</h1>
            {userWatchList?.map((contract: string, index: number) => (
              <span onClick={() => setSelectedContract(contract)} key={index}>
                {contract}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-grow flex-row flex bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex flex-col">
            <h2>Read Functions</h2>
            {readFunctions.map((func, index) => (
              <div key={index}>
                <h3>{func.name}</h3>
              </div>
            ))}
          </div>
          <div className="flex flex-col">
            <h2>Write Functions</h2>
            {writeFunctions.map((func, index) => (
              <div key={index}>
                <h3>{func.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

interface AbiFunction {
  inputs: any;
  name: string;
  outputs: any;
  stateMutability: string;
  type: string;
}

interface FunctionList {
  readableFunctions: AbiFunction[];
  writableFunctions: AbiFunction[];
}

function splitAbiIntoReadWriteFunctions(abi: AbiFunction[]): FunctionList {
  const result: FunctionList = {
    readableFunctions: [],
    writableFunctions: [],
  };
  for (const abiEntry of abi) {
    console.log(abiEntry);
    if (abiEntry.type === "function") {
      console.log(abiEntry.type);
      if (abiEntry.stateMutability === "view" || abiEntry.stateMutability === "pure") {
        result.readableFunctions.push(abiEntry);
      } else if (abiEntry.stateMutability === "nonpayable" || abiEntry.stateMutability === "payable") {
        result.writableFunctions.push(abiEntry);
      }
    }
  }
  return result;
}
