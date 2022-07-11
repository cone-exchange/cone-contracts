import {Deploy} from "../Deploy";
import {ethers} from "hardhat";
import {Verify} from "../../Verify";
import {Misc} from "../../Misc";
import {BscAddresses} from '../../addresses/BscAddresses';

async function main() {
  const signer = (await ethers.getSigners())[0];

  const FACTORY = '';

  const router = await Deploy.deployConeRouter01(signer, FACTORY, BscAddresses.WBNB_TOKEN);

  await Misc.wait(5);
  await Verify.verifyWithArgs(router.address, [FACTORY, BscAddresses.WBNB_TOKEN]);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
