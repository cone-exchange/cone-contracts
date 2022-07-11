import {Deploy} from "../Deploy";
import {ethers} from "hardhat";
import {Verify} from "../../Verify";
import {Misc} from "../../Misc";
import {BigNumber} from "ethers";
import {BscTestnetAddresses} from "../../addresses/BscTestnetAddresses";
import {writeFileSync} from "fs";
import {parseUnits} from 'ethers/lib/utils';


const voterTokens = [
  "",
];

const claimants = [
  "",
];

const claimantsAmounts = [
  parseUnits('1'),
];

async function main() {
  const signer = (await ethers.getSigners())[0];

  let minterMax = BigNumber.from("0");

  for (const c of claimantsAmounts) {
    minterMax = minterMax.add(c);
  }

  const core = await Deploy.deployCore(signer, BscTestnetAddresses.WMATIC_TOKEN, voterTokens, claimants, claimantsAmounts, minterMax)

  const data = ''
    + 'token: ' + core.token.address + '\n'
    + 'gaugesFactory: ' + core.gaugesFactory.address + '\n'
    + 'bribesFactory: ' + core.bribesFactory.address + '\n'
    + 'factory: ' + core.factory.address + '\n'
    + 'router: ' + core.router.address + '\n'
    + 've: ' + core.ve.address + '\n'
    + 'veDist: ' + core.veDist.address + '\n'
    + 'voter: ' + core.voter.address + '\n'
    + 'minter: ' + core.minter.address + '\n'
    + 'treasury: ' + core.treasury.address + '\n'

  console.log(data);
  writeFileSync('tmp/core.txt', data);

  await Misc.wait(5);

  await Verify.verify(core.treasury.address);
  await Verify.verify(core.token.address);
  await Verify.verify(core.gaugesFactory.address);
  await Verify.verify(core.bribesFactory.address);
  await Verify.verifyWithArgs(core.factory.address, [core.treasury.address]);
  await Verify.verifyWithArgs(core.router.address, [core.factory.address, BscTestnetAddresses.WMATIC_TOKEN]);
  await Verify.verifyWithArgs(core.ve.address, [core.token.address]);
  await Verify.verifyWithArgs(core.veDist.address, [core.ve.address]);
  await Verify.verifyWithArgs(core.voter.address, [core.ve.address, core.factory.address, core.gaugesFactory.address, core.bribesFactory.address]);
  await Verify.verifyWithArgs(core.minter.address, [core.voter.address, core.ve.address, core.veDist.address]);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
