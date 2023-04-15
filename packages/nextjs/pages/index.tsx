import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import type { NextPage } from "next";
import { useForm } from "react-hook-form";
// Import Swiper styles
import "swiper/css";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { useAccount, useContractRead } from "wagmi";
import MinusIcon from "~~/components/MinusIcon";
import PlusIcon from "~~/components/PlusIcon";
import SearchIcon from "~~/components/SearchIcon";
import WatchlistCarousel from "~~/components/WatchListCarousel";
import ContractCard from "~~/components/ui/ContractCard";
import ReadCard from "~~/components/ui/ReadCard";
import WriteCard from "~~/components/ui/WriteCard";
import { useDeployedContractInfo, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { getContractAbi } from "~~/hooks/useEtherscanAbi";
import { getSourceCode } from "~~/hooks/useEtherscanSourceCode";
import { truncateAddress } from "~~/utils/helpers";
import { getContractDetails, getSortedFunctions, useCreateMutation } from "~~/utils/openai-queries";

type AbiItem = {
  name?: string;
  type: string;
};
function extractFunctionNames(abi: AbiItem[]): string[] {
  return abi
    .filter(item => item.type === "function")
    .map(item => item.name || "")
    .filter(name => name.length > 0);
}

type FunctionObject = {
  inputs: any[];
  name: string;
  outputs: any[];
  stateMutability: string;
  type: string;
};

function reorderFunctionArray(functionNames: string[], functionObjects: FunctionObject[]): FunctionObject[] {
  const orderedFunctions = functionNames
    .map(name => functionObjects.find(func => func.name === name))
    .filter((func): func is FunctionObject => Boolean(func));

  const remainingFunctions = functionObjects.filter(func => !functionNames.includes(func.name));

  return [...orderedFunctions, ...remainingFunctions];
}

const Home: NextPage = () => {
  const { address } = useAccount();
  const { data: WatchListInfo } = useDeployedContractInfo("WatchList");
  const { register, handleSubmit } = useForm();

  const { data: userWatchList } = useContractRead({
    address: WatchListInfo?.address,
    abi: WatchListInfo?.abi,
    functionName: "getUserWatchList",
    watch: true,
    enabled: !!address,
    args: [address as string],
  });

  const [selectedContract, setSelectedContract] = useState<string>("");
  const [selectedContractName, setSelectedContractName] = useState<string>("");
  const [selectedContractDetails, setSelectedContractDetails] = useState<any>({});
  const [readFunctions, setReadFunctions] = useState<AbiFunction[]>([]);
  const [writeFunctions, setWriteFunctions] = useState<AbiFunction[]>([]);
  const [selectedTab, setSelectedTab] = useState<"read" | "write">("read");
  const [sourceCode, setSourceCode] = useState<string>("");
  const contractString = extractMainContractContent(sourceCode);
  const [abiData, setAbiData] = useState<any>("");
  const [functionNames, setFunctionNames] = useState<string[]>([]);

  const {
    mutateAsync: fetchOpenAiData,
    data: dataFromOpenAi,
    status,
  } = useCreateMutation(
    () => getContractDetails(contractString, selectedContractName),
    result => {
      // Do something with the awaited data, like updating the state or triggering side effects
      setSelectedContractDetails(extractKeyValuePairs(result));
    },
  );

  const { mutateAsync: fetchSortedFunctions } = useCreateMutation(
    () => getSortedFunctions(functionNames),
    result => {
      const topFunctions = extractStringsFromPartialArray(result);
      const reorderedReads = reorderFunctionArray(topFunctions, readFunctions);
      const reorderdWrites = reorderFunctionArray(topFunctions, writeFunctions);
      setReadFunctions(reorderedReads);
      setWriteFunctions(reorderdWrites);
    },
  );

  useEffect(() => {
    if (userWatchList?.length) {
      setSelectedContract(userWatchList?.[0]);
    }
  }, [userWatchList]);

  const { writeAsync } = useScaffoldContractWrite({
    contractName: "WatchList",
    functionName: "addToWatchList",
    args: [selectedContract?.replace(" ", "")],
  });

  const { writeAsync: removeFromWatchList } = useScaffoldContractWrite({
    contractName: "WatchList",
    functionName: "removeFromWatchList",
    args: [selectedContract?.replace(" ", "")],
  });

  const handleFetchData = async () => {
    // ABI Data
    const abiData = await getContractAbi(selectedContract);
    // const localFunctionNames = extractFunctionNames(JSON.parse(abiData));
    // console.log(localFunctionNames, "localFunctionNames");
    // setFunctionNames(localFunctionNames);
    // await fetchSortedFunctions(localFunctionNames);
    setAbiData(abiData);
    const { readableFunctions, writableFunctions } = splitAbiIntoReadWriteFunctions(JSON.parse(abiData));
    setReadFunctions(readableFunctions);
    setWriteFunctions(writableFunctions);

    // Source Code
    const localSourceCode = await getSourceCode(selectedContract);
    const contractString = extractMainContractContent(localSourceCode);

    setSourceCode(localSourceCode?.SourceCode);
    setSelectedContractName(localSourceCode?.ContractName);
  };

  const handleSortFunctions = async names => {
    await fetchSortedFunctions(names);
  };

  useEffect(() => {
    if (abiData) {
      const localFunctionNames = extractFunctionNames(JSON.parse(abiData));
      if (localFunctionNames.length) {
        handleSortFunctions(localFunctionNames);
      }
    }
  }, [abiData]);

  useEffect(() => {
    if (selectedContract) {
      handleFetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContract]);

  useEffect(() => {
    // console.log(sourceCode, "sourceCode");
    if (sourceCode && selectedContractName) {
      // console.log("sourceCode", sourceCode);
      // console.log(sourceCode, "sourceCode");
      runAnalyzeContract(sourceCode, selectedContractName);
    }
  }, [sourceCode]);

  const runAnalyzeContract = async (sourceCode, selectedContractName) => {
    await fetchOpenAiData();
  };

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

      <div className="flex w-full items-center flex-col flex-grow pt-10 ">
        <div className="px-5  md:min-w-[400px] min-w-[90%] max-w-[90%]">
          <form
            className="flex flex-row border-2 rounded-md py-2 border-[#516175] bg-[#111A2E] justify-between"
            onSubmit={handleSubmit(onSubmit)}
          >
            <input
              placeholder="Search for a contract"
              className="text-[#93A3B8] flex-1 pl-2 bg-[#111A2E] py-2  placeholder-[#93A3B8]"
              type="text"
              {...register("search", {
                required: true,
                onChange(event) {
                  setSelectedContract(event.target.value);
                },
              })}
            />
            <div className=" items-center justify-end flex bg-[#111A2E]">
              <button className="bg-[#0584C3] p-1 rounded-md mr-2">
                <SearchIcon />
              </button>
            </div>
          </form>
          <div className="flex flex-col mt-4 items-center min-w-[90%] ">
            <ContractCard
              status={status}
              selectedContractDetails={selectedContractDetails}
              setSelectedContract={setSelectedContract}
            />
          </div>
          {userWatchList?.includes(selectedContract) ? (
            <button
              onClick={removeFromWatchList}
              className="bg-[#111A2E] w-full flex flex-row items-center justify-center py-4 rounded-md mt-2"
            >
              Remove from Watchlist <MinusIcon />
            </button>
          ) : (
            <button
              onClick={onSubmit}
              className="bg-[#111A2E] w-full flex flex-row items-center justify-center py-4 rounded-md mt-2"
            >
              Add to Watchlist <PlusIcon />
            </button>
          )}

          <h1 className="mt-10">Watchlist</h1>
          <div className="flex flex-row overflow-x-scroll">
            {userWatchList?.map((contract, index) => {
              return (
                <div
                  onClick={() => setSelectedContract(contract)}
                  className={` w-32 h-32 bg-[#111A2E] p-4 flex items-center justify-center text-sm  m-4 ${
                    contract.toLowerCase() === selectedContract.toLowerCase() && "border border-[#0584C3]"
                  }`}
                >
                  {truncateAddress(contract)}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-grow relative flex-row overflow-y-scroll flex bg-base-300 w-full mt-16 ">
          <div className="tabs absolute top-0 w-full overflow-y-scroll ">
            <a
              onClick={() => setSelectedTab("read")}
              className={`tab tab-lifted flex flex-1 ${selectedTab === "read" && "tab-active"}`}
            >
              Read
            </a>
            <a
              onClick={() => setSelectedTab("write")}
              className={`tab tab-lifted flex flex-1 ${selectedTab === "write" && "tab-active"}`}
            >
              Write
            </a>
          </div>

          <div className="flex  flex-col w-full py-5 overflow-hidden">
            {selectedTab === "read" && (
              <div className="flex flex-col w-full h-full p-5 overflow-y-scroll">
                {readFunctions.map((func, index) => (
                  <ReadCard abi={abiData} contract={selectedContract} func={func} key={index} />
                ))}
              </div>
            )}
            {selectedTab === "write" && (
              <div className="flex flex-col w-full h-full p-5 overflow-y-scroll">
                {writeFunctions.map((func, index) => (
                  <WriteCard abi={abiData} contract={selectedContract} func={func} key={index} />
                ))}
              </div>
            )}
          </div>
          {/* <p>{sourceCode}</p> */}
        </div>
      </div>
    </>
  );
};

export default Home;

export interface AbiFunction {
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
    if (abiEntry.type === "function") {
      if (abiEntry.stateMutability === "view" || abiEntry.stateMutability === "pure") {
        result.readableFunctions.push(abiEntry);
      } else if (abiEntry.stateMutability === "nonpayable" || abiEntry.stateMutability === "payable") {
        result.writableFunctions.push(abiEntry);
      }
    }
  }
  return result;
}

function extractMainContractContent(sourceCode: string): string | null {
  // The regex pattern to match the content between 'contract' keyword and its corresponding braces
  // This pattern also checks if the contract inherits from other contracts
  const regex = /contract\s+(\w+)\s*(?:is\s+\w+(?:\s*,\s*\w+)*)?\s*\{([\s\S]*?)\}/g;

  // An exhaustive list of common boilerplate contract names
  const boilerplateContracts = [
    "Ownable",
    "Pausable",
    "ReentrancyGuard",
    "ERC20",
    "ERC721",
    "ERC1155",
    "SafeMath",
    "IERC20",
    "IERC721",
    "IERC1155",
    "Context",
    "AccessControl",
    "TimelockController",
    "EnumerableSet",
    "ERC20Detailed",
    "ERC20Burnable",
    "ERC20Capped",
    "ERC20Mintable",
    "ERC20Pausable",
    "ERC721Burnable",
    "ERC721Enumerable",
    "ERC721Metadata",
    "ERC721Pausable",
    "ERC721URIStorage",
    "ERC1155Burnable",
    "ERC1155MetadataURI",
    "ERC1155Pausable",
    "MinterRole",
    "PauserRole",
    "SignerRole",
    "WhitelistAdminRole",
    "WhitelistRole",
    "BlacklistRole",
    "SafeERC20",
    "Address",
    "EnumerableMap",
    "Strings",
    "Roles",
    "ECDSA",
    "SafeCast",
    "Governor",
    "GovernorTimelockControl",
    "GovernorVotes",
    "GovernorVotesQuorumFraction",
    "GovernorCountingSimple",
    "GovernorCountingCompound",
  ];

  let mainContract: string | null = null;
  let maxInheritanceCount = -1;
  let match: RegExpExecArray | null;

  // Iterate through all the matches
  while ((match = regex.exec(sourceCode)) !== null) {
    const contractName = match[1];

    // Skip boilerplate contracts
    if (boilerplateContracts.includes(contractName)) {
      continue;
    }

    const inheritanceCount = (match[0].match(/is\s+\w+/g) || []).length;

    // Check if the current contract has more inheritance than the previous main contract
    if (inheritanceCount > maxInheritanceCount) {
      maxInheritanceCount = inheritanceCount;
      mainContract = match[2];
    }
  }

  // Return the content of the main contract (with the most inheritance) or null if no contract was found
  return mainContract;
}

function extractKeyValuePairs(inputString: string): Record<string, string> {
  // The regex pattern to match the key-value pairs
  const regex = /(\w+):\s*"([^"]*)"/g;

  // Initialize an empty object to store the key-value pairs
  const result: Record<string, string> = {};

  // Execute the regex on the inputString
  let match: RegExpExecArray | null;

  while ((match = regex.exec(inputString)) !== null) {
    // Extract the key and value from the match
    const key = match[1];
    const value = match[2];

    // Add the key-value pair to the result object
    result[key] = value;
  }

  return result;
}

function extractStringsFromPartialArray(partialArrayString: string): string[] {
  const stringPattern = /"([^"]+)"/g;
  const matches = partialArrayString.match(stringPattern) || [];
  const extractedStrings = matches.map(match => match.slice(1, -1));

  return extractedStrings;
}
