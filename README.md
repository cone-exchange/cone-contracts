## Cone exchange

[![codecov](https://codecov.io/gh/cone-exchange/cone-contracts/branch/master/graph/badge.svg?token=U94WAFLRT7)](https://codecov.io/gh/cone-exchange/cone-contracts)

Cone allows low cost, near 0 slippage trades on uncorrelated or tightly correlated assets. The protocol incentivizes
fees instead of liquidity. Liquidity providers (LPs) are given incentives in the form of `token`, the amount received is
calculated as follows;

* 100% of weekly distribution weighted on votes from ve-token holders

The above is distributed to the `gauge` (see below), however LPs will earn between 40% and 100% based on their own
ve-token balance.

LPs with 0 ve* balance, will earn a maximum of 40%.

## AMM

What differentiates Cone's AMM;

Cone AMMs are compatible with all the standard features as popularized by Uniswap V2, these include;

* Lazy LP management
* Fungible LP positions
* Chained swaps to route between pairs
* priceCumulativeLast that can be used as external TWAP
* Flashloan proof TWAP
* Direct LP rewards via `skim`
* xy>=k

Cone adds on the following features;

* 0 upkeep 30 minute TWAPs. This means no additional upkeep is required, you can quote directly from the pair
* Fee split. Fees do not auto accrue, this allows external protocols to be able to profit from the fee claim
* New curve: x3y+y3x, which allows efficient stable swaps
* Curve
  quoting: `y = (sqrt((27 a^3 b x^2 + 27 a b^3 x^2)^2 + 108 x^12) + 27 a^3 b x^2 + 27 a b^3 x^2)^(1/3)/(3 2^(1/3) x) - (2^(1/3) x^3)/(sqrt((27 a^3 b x^2 + 27 a b^3 x^2)^2 + 108 x^12) + 27 a^3 b x^2 + 27 a b^3 x^2)^(1/3)`
* Routing through both stable and volatile pairs
* Flashloan proof reserve quoting

## token

**TBD**

## ve-token

Vested Escrow (ve), this is the core voting mechanism of the system, used by `ConeFactory` for gauge rewards and gauge
voting.

This is based off of ve(3,3)

* `deposit_for` deposits on behalf of
* `emit Transfer` to allow compatibility with third party explorers
* balance is moved to `tokenId` instead of `address`
* Locks are unique as NFTs, and not on a per `address` basis

```
function balanceOfNFT(uint) external returns (uint)
```

## ConePair

ConePair is the base pair, referred to as a `pool`, it holds two (2) closely correlated assets (example MIM-UST) if a
stable pool or two (2) uncorrelated assets (example FTM-SPELL) if not a stable pool, it uses the standard UniswapV2Pair
interface for UI & analytics compatibility.

```
function mint(address to) external returns (uint liquidity)
function burn(address to) external returns (uint amount0, uint amount1)
function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external
```

Functions should not be referenced directly, should be interacted with via the ConeRouter

Fees are not accrued in the base pair themselves, but are transfered to `PairFees` which has a 1:1 relationship
with `ConePair`

### ConeFactory

ConeFactory allows for the creation of `pools`
via ```function createPair(address tokenA, address tokenB, bool stable) external returns (address pair)```

ConeFactory uses an immutable pattern to create pairs, further reducing the gas costs involved in swaps

Anyone can create a pool permissionlessly.

### ConeRouter

ConeRouter is a wrapper contract and the default entry point into Stable V1 pools.

```

function addLiquidity(
    address tokenA,
    address tokenB,
    bool stable,
    uint amountADesired,
    uint amountBDesired,
    uint amountAMin,
    uint amountBMin,
    address to,
    uint deadline
) external ensure(deadline) returns (uint amountA, uint amountB, uint liquidity)

function removeLiquidity(
    address tokenA,
    address tokenB,
    bool stable,
    uint liquidity,
    uint amountAMin,
    uint amountBMin,
    address to,
    uint deadline
) public ensure(deadline) returns (uint amountA, uint amountB)

function swapExactTokensForTokens(
    uint amountIn,
    uint amountOutMin,
    route[] calldata routes,
    address to,
    uint deadline
) external ensure(deadline) returns (uint[] memory amounts)

```

## Gauge

Gauges distribute arbitrary `token(s)` rewards to ConePair LPs based on voting weights as defined by `ve` voters.

Arbitrary rewards can be added permissionlessly
via ```function notifyRewardAmount(address token, uint amount) external```

Gauges are completely overhauled to separate reward calculations from deposit and withdraw. This further protect LP
while allowing for infinite token calculations.

Previous iterations would track rewardPerToken as a shift everytime either totalSupply, rewardRate, or time changed.
Instead we track each individually as a checkpoint and then iterate and calculation.

## Bribe

Gauge bribes are natively supported by the protocol, Bribes inherit from Gauges and are automatically adjusted on votes.

Users that voted can claim their bribes via calling ```function getReward(address token) public```

Fees accrued by `Gauges` are distributed to `Bribes`

### BaseV1Voter

Gauge factory permissionlessly creates gauges for `pools` created by `ConeFactory`. Further it handles voting for 100%
of the incentives to `pools`.

```
function vote(address[] calldata _poolVote, uint[] calldata _weights) external
function distribute(address token) external
```

### veCONE distribution recipients

| Name | Address | Qty |
|:-----|:--------|:----|
| TBD   | TBD     | TBD |

### Testnet deployment

| Name   | Address                                                                                                                                |
|:-------|:---------------------------------------------------------------------------------------------------------------------------------------|
| wMATIC | [0xe02f20BB33F8Bfb48eB907523435CA886e139A08](https://mumbai.polygonscan.com/address/0xe02f20BB33F8Bfb48eB907523435CA886e139A08#code)   |
| USDT   | [0x801FC386bd0a7998EE162ffF32b793D0624f3476](https://mumbai.polygonscan.com/address/0x801FC386bd0a7998EE162ffF32b793D0624f3476#code)   |
| MIM    | [0xe0695CD828B63C0E4b70fdD44d0f066560EE8CfE](https://mumbai.polygonscan.com/address/0xe0695CD828B63C0E4b70fdD44d0f066560EE8CfE#code)   |
| DAI    | [0x1ac7b60D5dDeB00DF64C992c8c760463250Ca158](https://mumbai.polygonscan.com/address/0x1ac7b60D5dDeB00DF64C992c8c760463250Ca158#code)   |

| Name               | Address                                                                                                                               |
|:-------------------|:--------------------------------------------------------------------------------------------------------------------------------------|
| ConeFactory        | [0xD0692d6C30cd7a383f227Ba1cB28EeCE2F050926](https://mumbai.polygonscan.com/address/0xD0692d6C30cd7a383f227Ba1cB28EeCE2F050926#code)  |
| ConeRouter01       | [0xe9EdEb5576ea876014e76A496B4c564756ddDAEF](https://mumbai.polygonscan.com/address/0xe9EdEb5576ea876014e76A496B4c564756ddDAEF#code)  |
| GovernanceTreasury | [0x463cA34bC5530819EE1467A18C1c48a1bB306B74](https://mumbai.polygonscan.com/address/0x463cA34bC5530819EE1467A18C1c48a1bB306B74#code)  |
| BribeFactory       | [0x0C6868831c504Fb0bB61A54FEfC6464804380508](https://mumbai.polygonscan.com/address/0x0C6868831c504Fb0bB61A54FEfC6464804380508#code)  |
| GaugesFactory      | [0xC9d5917A0cb82450Cd687AF31eCAaC967D7F121C](https://mumbai.polygonscan.com/address/0xC9d5917A0cb82450Cd687AF31eCAaC967D7F121C#code)  |
| CONE               | [0xD8a4054d63fCb0030BC73E2323344Ae59A19E92b](https://mumbai.polygonscan.com/address/0xD8a4054d63fCb0030BC73E2323344Ae59A19E92b#code)  |
| ConeMinter         | [0x08d7607b2FD46ae255040014a39CDC2094e55901](https://mumbai.polygonscan.com/address/0x08d7607b2FD46ae255040014a39CDC2094e55901#code)  |
| ConeVoter          | [0x75e1e98650c119c4E3dCE3070CE6A5397Ed70c6a](https://mumbai.polygonscan.com/address/0x75e1e98650c119c4E3dCE3070CE6A5397Ed70c6a#code)  |
| veCONE             | [0xa4EB2E1284D9E30fb656Fe6b34c1680Ef5d4cBFC](https://mumbai.polygonscan.com/address/0xa4EB2E1284D9E30fb656Fe6b34c1680Ef5d4cBFC#code)  |
| VeDist             | [0x0B62ad43837A69Ad60289EEea7C6e907e759F6E8](https://mumbai.polygonscan.com/address/0x0B62ad43837A69Ad60289EEea7C6e907e759F6E8#code)  |
| Controller         | [0xC363F3D4e1C005bf5321040653A088F71Bb974Ab](https://mumbai.polygonscan.com/address/0xC363F3D4e1C005bf5321040653A088F71Bb974Ab#code)  |

### BSC deployment

