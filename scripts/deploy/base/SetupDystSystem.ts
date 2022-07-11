import {Deploy} from "../Deploy";
import {ethers} from "hardhat";
import {Verify} from "../../Verify";
import {Misc} from "../../Misc";
import {BigNumber} from "ethers";
import {BscTestnetAddresses} from "../../addresses/BscTestnetAddresses";
import {writeFileSync} from "fs";
import {parseUnits} from "ethers/lib/utils";
import {BscAddresses} from '../../addresses/BscAddresses';


const voterTokens = [
  BscAddresses.WBNB_TOKEN,
  BscAddresses.WETH_TOKEN,
  BscAddresses.USDC_TOKEN,
  BscAddresses.FRAX_TOKEN,
  BscAddresses.DAI_TOKEN,
  BscAddresses.USDT_TOKEN,
  BscAddresses.MAI_TOKEN,
  BscAddresses.BUSD_TOKEN,
];

const claimants = [
  ''
];

const claimantsAmounts = [
  parseUnits("10000000"),
];

const FACTORY = '';

async function main() {
  const signer = (await ethers.getSigners())[0];

  let minterMax = BigNumber.from("0");

  for (const c of claimantsAmounts) {
    minterMax = minterMax.add(c);
  }

  const [
    controller,
    token,
    gaugesFactory,
    bribesFactory,
    ve,
    veDist,
    voter,
    minter,
  ] = await Deploy.deployConeSystem(
    signer,
    BscTestnetAddresses.WBNB_TOKEN,
    voterTokens,
    claimants,
    claimantsAmounts,
    minterMax,
    FACTORY,
    2
  );

  const data = ''
    + 'controller: ' + controller.address + '\n'
    + 'token: ' + token.address + '\n'
    + 'gaugesFactory: ' + gaugesFactory.address + '\n'
    + 'bribesFactory: ' + bribesFactory.address + '\n'
    + 've: ' + ve.address + '\n'
    + 'veDist: ' + veDist.address + '\n'
    + 'voter: ' + voter.address + '\n'
    + 'minter: ' + minter.address + '\n'

  console.log(data);
  writeFileSync('tmp/core.txt', data);

  await Misc.wait(5);

  await Verify.verify(token.address);
  await Verify.verify(gaugesFactory.address);
  await Verify.verify(bribesFactory.address);
  await Verify.verifyWithArgs(ve.address, [token.address]);
  await Verify.verifyWithArgs(veDist.address, [ve.address]);
  await Verify.verifyWithArgs(voter.address, [ve.address, FACTORY, gaugesFactory.address, bribesFactory.address]);
  await Verify.verifyWithArgs(minter.address, [voter.address, ve.address, veDist.address]);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
