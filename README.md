## Dystopia
Dystopia allows low cost, near 0 slippage trades on uncorrelated or tightly correlated assets. The protocol incentivizes fees instead of liquidity. Liquidity providers (LPs) are given incentives in the form of `token`, the amount received is calculated as follows;

* 100% of weekly distribution weighted on votes from ve-token holders

The above is distributed to the `gauge` (see below), however LPs will earn between 40% and 100% based on their own ve-token balance.

LPs with 0 ve* balance, will earn a maximum of 40%.

## AMM

What differentiates Dystopia's AMM;

Dystopia AMMs are compatible with all the standard features as popularized by Uniswap V2, these include;

* Lazy LP management
* Fungible LP positions
* Chained swaps to route between pairs
* priceCumulativeLast that can be used as external TWAP
* Flashloan proof TWAP
* Direct LP rewards via `skim`
* xy>=k

Dystopia adds on the following features;

* 0 upkeep 30 minute TWAPs. This means no additional upkeep is required, you can quote directly from the pair
* Fee split. Fees do not auto accrue, this allows external protocols to be able to profit from the fee claim
* New curve: x3y+y3x, which allows efficient stable swaps
* Curve quoting: `y = (sqrt((27 a^3 b x^2 + 27 a b^3 x^2)^2 + 108 x^12) + 27 a^3 b x^2 + 27 a b^3 x^2)^(1/3)/(3 2^(1/3) x) - (2^(1/3) x^3)/(sqrt((27 a^3 b x^2 + 27 a b^3 x^2)^2 + 108 x^12) + 27 a^3 b x^2 + 27 a b^3 x^2)^(1/3)`
* Routing through both stable and volatile pairs
* Flashloan proof reserve quoting

## token

**TBD**

## ve-token

Vested Escrow (ve), this is the core voting mechanism of the system, used by `BaseV1Factory` for gauge rewards and gauge voting.

This is based off of ve(3,3)

* `deposit_for` deposits on behalf of
* `emit Transfer` to allow compatibility with third party explorers
* balance is moved to `tokenId` instead of `address`
* Locks are unique as NFTs, and not on a per `address` basis

```
function balanceOfNFT(uint) external returns (uint)
```

## BaseV1Pair

Base V1 pair is the base pair, referred to as a `pool`, it holds two (2) closely correlated assets (example MIM-UST) if a stable pool or two (2) uncorrelated assets (example FTM-SPELL) if not a stable pool, it uses the standard UniswapV2Pair interface for UI & analytics compatibility.

```
function mint(address to) external returns (uint liquidity)
function burn(address to) external returns (uint amount0, uint amount1)
function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external
```

Functions should not be referenced directly, should be interacted with via the BaseV1Router

Fees are not accrued in the base pair themselves, but are transfered to `BaseV1Fees` which has a 1:1 relationship with `BaseV1Pair`

### BaseV1Factory

Base V1 factory allows for the creation of `pools` via ```function createPair(address tokenA, address tokenB, bool stable) external returns (address pair)```

Base V1 factory uses an immutable pattern to create pairs, further reducing the gas costs involved in swaps

Anyone can create a pool permissionlessly.

### BaseV1Router

Base V1 router is a wrapper contract and the default entry point into Stable V1 pools.

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

Gauges distribute arbitrary `token(s)` rewards to BaseV1Pair LPs based on voting weights as defined by `ve` voters.

Arbitrary rewards can be added permissionlessly via ```function notifyRewardAmount(address token, uint amount) external```

Gauges are completely overhauled to separate reward calculations from deposit and withdraw. This further protect LP while allowing for infinite token calculations.

Previous iterations would track rewardPerToken as a shift everytime either totalSupply, rewardRate, or time changed. Instead we track each individually as a checkpoint and then iterate and calculation.

## Bribe

Gauge bribes are natively supported by the protocol, Bribes inherit from Gauges and are automatically adjusted on votes.

Users that voted can claim their bribes via calling ```function getReward(address token) public```

Fees accrued by `Gauges` are distributed to `Bribes`

### BaseV1Voter

Gauge factory permissionlessly creates gauges for `pools` created by `BaseV1Factory`. Further it handles voting for 100% of the incentives to `pools`.

```
function vote(address[] calldata _poolVote, uint[] calldata _weights) external
function distribute(address token) external
```

### veNFT distribution recipients

| Name | Address | Qty |
| :--- | :--- | :--- |


### Mumbai mumbai deployment

| Name | Address |
| :--- | :--- |
| wMATIC| [0x37b2c89A2152E40841E022dD1044274e30aFe306](https://mumbai.polygonscan.com/address/0x37b2c89A2152E40841E022dD1044274e30aFe306#code) |
| USDT| [0x801FC386bd0a7998EE162ffF32b793D0624f3476](https://mumbai.polygonscan.com/address/0x801FC386bd0a7998EE162ffF32b793D0624f3476#code) |
| MIM | [0xe0695CD828B63C0E4b70fdD44d0f066560EE8CfE](https://mumbai.polygonscan.com/address/0xe0695CD828B63C0E4b70fdD44d0f066560EE8CfE#code) |
| DAI | [0x1ac7b60D5dDeB00DF64C992c8c760463250Ca158](https://mumbai.polygonscan.com/address/0x1ac7b60D5dDeB00DF64C992c8c760463250Ca158#code) |
| BaseV1 | [0x10b6aC405CB39364D0493fa231926517E587E7c4](https://mumbai.polygonscan.com/address/0x10b6aC405CB39364D0493fa231926517E587E7c4#code) |

| Name | Address |
| :--- | :--- |
| BaseV1Factory | [0x3a5C1E2f67Ba8A3bA20Fc5B7921E7Ac7cdB87D6F](https://mumbai.polygonscan.com/address/0x3a5C1E2f67Ba8A3bA20Fc5B7921E7Ac7cdB87D6F#code) |
| BaseV1BribeFactory | [0x8A752F4D73A5Da404131751ccCfbf1CA40c16e52](https://mumbai.polygonscan.com/address/0x8A752F4D73A5Da404131751ccCfbf1CA40c16e52#code) |
| BaseV1GaugesFactory | [0x55Fe5b1f417C771Ff99bC00FF05A3dE8B208B1c7](https://mumbai.polygonscan.com/address/0x55Fe5b1f417C771Ff99bC00FF05A3dE8B208B1c7#code) |
| BaseV1Router01 | [0xB2090e2140B52534047B605601Ad86038e39C4cE](https://mumbai.polygonscan.com/address/0xB2090e2140B52534047B605601Ad86038e39C4cE#code) |
| BaseV1Voter | [0xF7fA21Ab01027A08Fb74E26a8F7FAfDF88cAF9D2](https://mumbai.polygonscan.com/address/0xF7fA21Ab01027A08Fb74E26a8F7FAfDF88cAF9D2#code) |
| veNFT | [0xc494C3b51D3e59211385e191D53C8F21ad96f618](https://mumbai.polygonscan.com/address/0xc494C3b51D3e59211385e191D53C8F21ad96f618#code) |
| veNFT-dist | [0xb259eEc5ed3131BDEE89d528c538BaA79CE031Fd](https://mumbai.polygonscan.com/address/0xb259eEc5ed3131BDEE89d528c538BaA79CE031Fd#code) |
| BaseV1Minter | [0xa0f37486eEB808c76FF2ED6E4319c94287aD4d75](https://mumbai.polygonscan.com/address/0xa0f37486eEB808c76FF2ED6E4319c94287aD4d75#code) |

