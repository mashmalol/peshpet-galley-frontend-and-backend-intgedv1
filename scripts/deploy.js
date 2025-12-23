const hre = require("hardhat");

async function main() {
  console.log("Deploying PeshPetNFT contract...");

  const PeshPetNFT = await hre.ethers.getContractFactory("PeshPetNFT");
  const peshPetNFT = await PeshPetNFT.deploy();

  await peshPetNFT.deployed();

  console.log("PeshPetNFT deployed to:", peshPetNFT.address);
  console.log("Save this address to your .env file as REACT_APP_CONTRACT_ADDRESS");
  
  // Wait for block confirmations
  console.log("Waiting for block confirmations...");
  await peshPetNFT.deployTransaction.wait(5);
  
  console.log("Contract deployed and confirmed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
