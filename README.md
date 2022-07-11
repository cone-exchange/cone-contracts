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

| Name       | Address                                                                                                                           |
|:-----------|:----------------------------------------------------------------------------------------------------------------------------------|
| wBNB       | [0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd](https://testnet.bscscan.com/address/0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd#code) |
| USDC_TOKEN | [0x88a12B7b6525c0B46c0c200405f49cE0E72D71Aa](https://testnet.bscscan.com/address/0x88a12B7b6525c0B46c0c200405f49cE0E72D71Aa#code) |
| MIM_TOKEN  | [0x549aE613Bb492CCf68A6620848C80262709a1fb4](https://testnet.bscscan.com/address/0x549aE613Bb492CCf68A6620848C80262709a1fb4#code) |
| DAI_TOKEN  | [0xf31d85CA2811B482f783860aacE022cf837dF7fE](https://testnet.bscscan.com/address/0xf31d85CA2811B482f783860aacE022cf837dF7fE#code) |
| USDT_TOKEN | [0x0EFc2D2D054383462F2cD72eA2526Ef7687E1016](https://testnet.bscscan.com/address/0x0EFc2D2D054383462F2cD72eA2526Ef7687E1016#code) |
| MAI_TOKEN  | [0xbf1fc29668e5f5Eaa819948599c9Ac1B1E03E75F](https://testnet.bscscan.com/address/0xbf1fc29668e5f5Eaa819948599c9Ac1B1E03E75F#code) |

| Name                 | Address                                                                                                                            |
|:---------------------|:-----------------------------------------------------------------------------------------------------------------------------------|
| ConeFactory          | [0xd055b086180cB6dac888792C9307970Ed10CF137](https://testnet.bscscan.com/address/0xd055b086180cB6dac888792C9307970Ed10CF137#code)  |
| ConeRouter01         | [0x6B2e0fACD2F2A8f407aC591067Ac06b5d29247E4](https://testnet.bscscan.com/address/0x6B2e0fACD2F2A8f407aC591067Ac06b5d29247E4#code)  |
| BribeFactory         | [0x099C314F792e1F91f53765Fc64AaDCcf4dCf1538](https://testnet.bscscan.com/address/0x099C314F792e1F91f53765Fc64AaDCcf4dCf1538#code)  |
| GaugesFactory        | [0x00379dD90b2A337C4652E286e4FBceadef940a21](https://testnet.bscscan.com/address/0x00379dD90b2A337C4652E286e4FBceadef940a21#code)  |
| CONE                 | [0xd353254872E8797B159594c1E528b8Be9a6cb1F8](https://testnet.bscscan.com/address/0xd353254872E8797B159594c1E528b8Be9a6cb1F8#code)  |
| ConeMinter           | [0x57Cf87b92E38f619bBeB2F13800730e668d69d7D](https://testnet.bscscan.com/address/0x57Cf87b92E38f619bBeB2F13800730e668d69d7D#code)  |
| ConeVoter            | [0x81367059892aa1D8503a79a0Af9254DD0a09afBF](https://testnet.bscscan.com/address/0x81367059892aa1D8503a79a0Af9254DD0a09afBF#code)  |
| veCONE               | [0x7AD5935EA295c4E743e4f2f5B4CDA951f41223c2](https://testnet.bscscan.com/address/0x7AD5935EA295c4E743e4f2f5B4CDA951f41223c2#code)  |
| VeDist               | [0x2A3df2a428EB74B241Cf1d3374Fb07983c7059F3](https://testnet.bscscan.com/address/0x2A3df2a428EB74B241Cf1d3374Fb07983c7059F3#code)  |
| Controller           | [0x0A0846c978a56D6ea9D2602eeb8f977B21F3207F](https://testnet.bscscan.com/address/0x0A0846c978a56D6ea9D2602eeb8f977B21F3207F#code)  |

### BSC deployment

