// import {ethers} from "hardhat";

// async function initNUTSToken() {

//   const contractName = "Test";
//   const contractSymbol = "test";
//   const totalSupply = 1000000000000;

//   const NUTSToken = await ethers.getContractFactory("NUTSToken");
//   const nutsToken = await NUTSToken.deploy(contractName, contractSymbol, totalSupply);

//   await nutsToken.deployed();

//   console.log("ScrapBoxGames tNUTS deployed to: ", nutsToken.address);

//   return nutsToken.address;
// }

// async function main() {

//   await initNUTSToken();

// }

// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });
