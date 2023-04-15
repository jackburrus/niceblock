import React, { useState } from "react";
import ContractCard from "./ui/ContractCard";

const WatchlistCarousel = ({ userWatchList, selectedContractDetails, setSelectedContract }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const handlePrevCard = () => {
    setCurrentCardIndex(prevIndex => (prevIndex === 0 ? userWatchList.length - 1 : prevIndex - 1));
  };

  const handleNextCard = () => {
    setCurrentCardIndex(prevIndex => (prevIndex === userWatchList.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="flex flex-col items-center">
      <div className="border  flex flex-row overflow-hidden relative" style={{ width: "100%", height: "100%" }}>
        {userWatchList?.map((contract: string, index: number) => {
          console.log(contract, "contract");
          return (
            <div
              key={index}
              className={`absolute w-full h-full duration-300 ${currentCardIndex === index ? "" : "hidden"}`}
            ></div>
          );
        })}
      </div>
      <button onClick={handlePrevCard} className="mt-4 mr-2">
        Previous
      </button>
      <button onClick={handleNextCard} className="mt-4 ml-2">
        Next
      </button>
    </div>
  );
};

export default WatchlistCarousel;
