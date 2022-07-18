import {ethers} from "hardhat";
import {
  ConeFactory__factory, ConeMinter, ConeMinter__factory,
  ConeRouter01__factory,
  ConeVoter, ConeVoter__factory,
  IFactory__factory,
  IRouter__factory, IWMATIC, IWMATIC__factory,
  Token__factory
} from '../../typechain';
import {TestHelper} from '../../test/TestHelper';
import {formatUnits, parseUnits} from 'ethers/lib/utils';
import {BscTestnetAddresses} from '../addresses/BscTestnetAddresses';
import {Misc} from '../Misc';

async function main() {
  const signer = (await ethers.getSigners())[0];

  const tokenAdr = '0x875976AeF383Fe4135B93C3989671056c4dEcDFF';
  const gaugesFactoryAdr = '0xC363F3D4e1C005bf5321040653A088F71Bb974Ab';
  const bribesFactoryAdr = '0xD8a4054d63fCb0030BC73E2323344Ae59A19E92b';
  const factoryAdr = '0x422282F18CFE573e7dc6BEcC7242ffad43340aF8';
  const routerAdr = '0x13d862a01d0AB241509A2e47e31d0db04e9b9F49';
  const veAdr = '0xbEB411eAD71713E7f2814326498Ff2a054242206';
  const veDistAdr = '0xa4EB2E1284D9E30fb656Fe6b34c1680Ef5d4cBFC';
  const voterAdr = '0xC9d5917A0cb82450Cd687AF31eCAaC967D7F121C';
  const minterAdr = '0x0C6868831c504Fb0bB61A54FEfC6464804380508';

  const usdc = BscTestnetAddresses.USDC_TOKEN;
  const mim = BscTestnetAddresses.MIM_TOKEN;
  const dai = BscTestnetAddresses.DAI_TOKEN;
  const usdt = BscTestnetAddresses.USDT_TOKEN;
  const mai = BscTestnetAddresses.MAI_TOKEN;

  const router = ConeRouter01__factory.connect(routerAdr, signer);
  const factory = ConeFactory__factory.connect(factoryAdr, signer);
  const voter = ConeVoter__factory.connect(voterAdr, signer);
  const minter = ConeMinter__factory.connect(minterAdr, signer);

  // *** MINT tokens
  console.log("start mint tokens")

  await Misc.runAndWait(() => Token__factory.connect(usdc, signer).mint(signer.address, parseUnits('1000000', 6)));
  await Misc.runAndWait(() => Token__factory.connect(mim, signer).mint(signer.address, parseUnits('1000000', 18)));
  await Misc.runAndWait(() => Token__factory.connect(dai, signer).mint(signer.address, parseUnits('1000000', 18)));
  await Misc.runAndWait(() => Token__factory.connect(usdt, signer).mint(signer.address, parseUnits('1000000', 8)));
  await Misc.runAndWait(() => Token__factory.connect(mai, signer).mint(signer.address, parseUnits('1000000', 18)));

  // await Misc.runAndWait(() => IWMATIC__factory.connect(BscTestnetAddresses.WBNB_TOKEN, signer).deposit({value: parseUnits('0.1')}));

  console.log("tokens minted")

  // ***  GENERATE PAIRS

  const pairUsdcMimS = await TestHelper.addLiquidity(
    factory,
    router,
    signer,
    usdc,
    mim,
    parseUnits('10000', 6),
    parseUnits('10000', 18),
    true
  );

  const pairUsdcMimV = await TestHelper.addLiquidity(
    factory,
    router,
    signer,
    usdc,
    mim,
    parseUnits('100000', 6),
    parseUnits('100000', 18),
    false
  );

  const pairUsdcDaiS = await TestHelper.addLiquidity(
    factory,
    router,
    signer,
    usdc,
    dai,
    parseUnits('20000', 6),
    parseUnits('3333', 18),
    true
  );

  const pairUsdcDaiV = await TestHelper.addLiquidity(
    factory,
    router,
    signer,
    usdc,
    dai,
    parseUnits('10000', 6),
    parseUnits('55555', 18),
    false
  );

  const pairUsdcUsdtS = await TestHelper.addLiquidity(
    factory,
    router,
    signer,
    usdc,
    usdt,
    parseUnits('40000', 6),
    parseUnits('35000', 8),
    true
  );

  const pairUsdcWbnb = await TestHelper.addLiquidity(
    factory,
    router,
    signer,
    usdc,
    BscTestnetAddresses.WBNB_TOKEN,
    parseUnits('1000', 6),
    parseUnits('0.1', 18),
    true
  );


  // *** VOTE

  console.log('vote')

  await Misc.runAndWait(() => voter.vote(1, [
    pairUsdcMimS.address,
    pairUsdcMimV.address,
    pairUsdcDaiS.address,
    pairUsdcDaiV.address,
    pairUsdcUsdtS.address,
    pairUsdcWbnb.address,
  ], [1, 2, 3, 4, 5, 6]));

  await Misc.runAndWait(() => voter.vote(2, [
    pairUsdcMimS.address,
    pairUsdcMimV.address,
    pairUsdcDaiS.address,
    pairUsdcDaiV.address,
    pairUsdcUsdtS.address,
    pairUsdcWbnb.address,
  ], [13, 24, 35, 46, 51, 61]));

  await Misc.runAndWait(() => voter.vote(3, [
    pairUsdcMimS.address,
    pairUsdcMimV.address,
    pairUsdcDaiS.address,
    pairUsdcDaiV.address,
    pairUsdcUsdtS.address,
    pairUsdcWbnb.address,
  ], [913, 824, 735, 646, 451, 761]));

  console.log('vote ended')


  await Misc.runAndWait(() => minter.updatePeriod());
  await Misc.runAndWait(() => voter.distributeAll());

  console.log('rewards distributed')

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
