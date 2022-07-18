import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {BigNumber, utils} from "ethers";
import {
  ConeFactory,
  ConePair,
  ConePair__factory,
  ConeRouter01,
  Gauge,
  IERC20__factory,
  Token
} from "../typechain";
import chai from "chai";
import {Deploy} from "../scripts/deploy/Deploy";
import {ethers} from "hardhat";
import {Misc} from '../scripts/Misc';

const {expect} = chai;

export class TestHelper {

  public static async addLiquidity(
    factory: ConeFactory,
    router: ConeRouter01,
    owner: SignerWithAddress,
    tokenA: string,
    tokenB: string,
    tokenAAmount: BigNumber,
    tokenBAmount: BigNumber,
    stable: boolean
  ) {
    console.log('start add liquidity', tokenA, tokenB)
    TestHelper.gte(await IERC20__factory.connect(tokenA, owner).balanceOf(owner.address), tokenAAmount);
    TestHelper.gte(await IERC20__factory.connect(tokenB, owner).balanceOf(owner.address), tokenBAmount);
    await Misc.runAndWait(() => IERC20__factory.connect(tokenA, owner).approve(router.address, tokenAAmount));
    await Misc.runAndWait(() => IERC20__factory.connect(tokenB, owner).approve(router.address, tokenBAmount));
    await Misc.runAndWait(() => router.connect(owner).addLiquidity(tokenA, tokenB, stable, tokenAAmount, tokenBAmount, 0, 0, owner.address, Date.now() + 99999999));
    const address = await factory.getPair(tokenA, tokenB, stable);
    console.log('liquidity added', address);
    return ConePair__factory.connect(address, owner);
  }

  public static async depositToGauge(
    owner: SignerWithAddress,
    gauge: Gauge,
    pair: ConePair,
    amount: BigNumber,
    tokenId: number
  ) {
    TestHelper.gte(await pair.balanceOf(owner.address), amount);
    await pair.connect(owner).approve(gauge.address, amount);
    await gauge.connect(owner).deposit(amount, tokenId);
  }

  public static async createMockTokensAndMint(
    owner: SignerWithAddress
  ) {
    const ust = await Deploy.deployContract(owner, 'Token', 'UST', 'UST', 6, owner.address) as Token;
    await ust.mint(owner.address, utils.parseUnits('1000000000000', 6));

    const mim = await Deploy.deployContract(owner, 'Token', 'MIM', 'MIM', 18, owner.address) as Token;
    await mim.mint(owner.address, utils.parseUnits('1000000000000'));

    const dai = await Deploy.deployContract(owner, 'Token', 'DAI', 'DAI', 18, owner.address) as Token;
    await dai.mint(owner.address, utils.parseUnits('1000000000000'));

    return [ust, mim, dai];
  }

  public static async permitForPair(
    owner: SignerWithAddress,
    pair: ConePair,
    spender: string,
    amount: BigNumber,
    deadline = '99999999999'
  ) {
    const name = await pair.name()
    const nonce = await pair.nonces(owner.address)
    const chainId = await pair.chainId();

    console.log('permit name', name)
    console.log('permit nonce', nonce.toString())
    console.log('permit amount', amount.toString())

    const signature = await owner._signTypedData(
      {
        name,
        version: '1',
        chainId: chainId + '',
        verifyingContract: pair.address
      },
      {
        "Permit": [
          {
            "name": "owner",
            "type": "address"
          },
          {
            "name": "spender",
            "type": "address"
          },
          {
            "name": "value",
            "type": "uint256"
          },
          {
            "name": "nonce",
            "type": "uint256"
          },
          {
            "name": "deadline",
            "type": "uint256"
          }
        ]
      },
      {
        owner: owner.address,
        spender,
        value: amount.toString(),
        nonce: nonce.toHexString(),
        deadline
      }
    );

    return ethers.utils.splitSignature(signature);
  }

  public static gte(actual: BigNumber, expected: BigNumber) {
    expect(actual.gte(expected)).is.eq(true,
      `Expected: ${expected.toString()}, actual: ${actual.toString()}`);
  }

  public static closer(actual: BigNumber, expected: BigNumber, delta: BigNumber) {
    expect(actual.gte(expected.sub(delta)) && actual.lte(expected.add(delta))).is.eq(true,
      `Expected: ${expected.sub(delta).toString()} - ${expected.add(delta).toString()}, actual: ${actual.toString()}, delta: ${expected.sub(actual)}`);
  }

}
