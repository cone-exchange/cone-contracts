import {Deploy} from "../Deploy";
import {ethers} from "hardhat";
import {Verify} from "../../Verify";
import {Misc} from "../../Misc";

async function main() {
  const signer = (await ethers.getSigners())[0];
  const contract = await Deploy.deployContract(signer, 'Multicall');

  await Misc.wait(5);
  await Verify.verify(contract.address);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
