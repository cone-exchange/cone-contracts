import {ethers} from "hardhat";
import {
  ConeFactory__factory,
  ConePair,
  ConePair__factory,
  ConeRouter01__factory,
  IERC20__factory
} from '../../typechain';
import {TestHelper} from '../../test/TestHelper';
import {formatUnits, parseUnits} from 'ethers/lib/utils';
import {BscAddresses} from '../addresses/BscAddresses';
import {Misc} from '../Misc';

async function main() {
  const signer = (await ethers.getSigners())[0];
  // const signer = await Misc.impersonate('0xbbbbb8C4364eC2ce52c59D2Ed3E56F307E529a94');

  console.log('current block', await signer.provider?.getBlockNumber())

  const factoryAdr = '0x0EFc2D2D054383462F2cD72eA2526Ef7687E1016';
  const routerAdr = '0xbf1fc29668e5f5Eaa819948599c9Ac1B1E03E75F';


  const router = ConeRouter01__factory.connect(routerAdr, signer);
  const factory = ConeFactory__factory.connect(factoryAdr, signer);

  // ***

  // const balance = await IERC20__factory.connect('0x89B26AF36fA8705A27934fcED56D154BDA01315a', signer).balanceOf(signer.address);
  // //
  // await Misc.runAndWait(() => IERC20__factory.connect('0x89B26AF36fA8705A27934fcED56D154BDA01315a', signer).approve(routerAdr, balance));
  // //
  // await Misc.runAndWait(() => router.removeLiquidity(
  //   BscAddresses.WETH_TOKEN,
  //   BscAddresses.USDC_TOKEN,
  //   false,
  //   balance,
  //   0,
  //   0,
  //   signer.address,
  //   999999999999
  // ));

  const pair = await TestHelper.addLiquidity(
    factory,
    router,
    signer,
    BscAddresses.WETH_TOKEN,
    BscAddresses.USDC_TOKEN,
    parseUnits('0.136', 18),
    parseUnits('213', 18),
    false
  );

  console.log(formatUnits(await ConePair__factory.connect('0x89B26AF36fA8705A27934fcED56D154BDA01315a', signer).reserve0()));
  console.log(formatUnits(await ConePair__factory.connect('0x89B26AF36fA8705A27934fcED56D154BDA01315a', signer).reserve1()));

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
