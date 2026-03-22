// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {IUnlockCallback} from "v4-core/src/interfaces/callback/IUnlockCallback.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";
import {Currency, CurrencyLibrary} from "v4-core/src/types/Currency.sol";
import {TransientStateLibrary} from "v4-core/src/libraries/TransientStateLibrary.sol";
import {IERC20Minimal} from "v4-core/src/interfaces/external/IERC20Minimal.sol";

/// @title ImpactSwapRouter
/// @notice Simple swap router for ImpactHook pools. Users approve tokens to
/// this router once, then call swap() with a clean interface.
/// Handles afterSwapReturnDelta (hook fees) and settles all deltas properly.
contract ImpactSwapRouter is IUnlockCallback {
    using TransientStateLibrary for IPoolManager;
    using CurrencyLibrary for Currency;

    IPoolManager public immutable poolManager;

    struct SwapCallbackData {
        address sender;
        PoolKey key;
        bool zeroForOne;
        uint256 amountIn;
        uint160 sqrtPriceLimitX96;
    }

    error SlippageExceeded(uint256 minOut, uint256 actualOut);

    constructor(IPoolManager _poolManager) {
        poolManager = _poolManager;
    }

    /// @notice Swap exact input through an impact pool.
    /// @param key The pool key (token pair + fee + hook)
    /// @param zeroForOne True = sell token0 for token1, false = opposite
    /// @param amountIn Amount of input token to swap
    /// @param minAmountOut Minimum output after hook fees (slippage protection)
    /// @return amountOut The actual output amount received
    function swap(
        PoolKey calldata key,
        bool zeroForOne,
        uint256 amountIn,
        uint256 minAmountOut
    ) external returns (uint256 amountOut) {
        // sqrtPriceLimit: use min/max to allow any price movement
        uint160 sqrtPriceLimitX96 = zeroForOne
            ? 4295128740 // MIN_SQRT_PRICE + 1
            : 1461446703485210103287273052203988822378723970342; // MAX_SQRT_PRICE - 1

        bytes memory result = poolManager.unlock(
            abi.encode(SwapCallbackData({
                sender: msg.sender,
                key: key,
                zeroForOne: zeroForOne,
                amountIn: amountIn,
                sqrtPriceLimitX96: sqrtPriceLimitX96
            }))
        );

        amountOut = abi.decode(result, (uint256));
        if (amountOut < minAmountOut) revert SlippageExceeded(minAmountOut, amountOut);
    }

    function unlockCallback(bytes calldata rawData) external returns (bytes memory) {
        require(msg.sender == address(poolManager), "not pool manager");

        SwapCallbackData memory data = abi.decode(rawData, (SwapCallbackData));

        // Execute the swap (exact input = negative amountSpecified)
        BalanceDelta delta = poolManager.swap(
            data.key,
            IPoolManager.SwapParams({
                zeroForOne: data.zeroForOne,
                amountSpecified: -int256(data.amountIn),
                sqrtPriceLimitX96: data.sqrtPriceLimitX96
            }),
            ""
        );

        // Determine input/output currencies and amounts
        Currency inputCurrency = data.zeroForOne ? data.key.currency0 : data.key.currency1;
        Currency outputCurrency = data.zeroForOne ? data.key.currency1 : data.key.currency0;

        // Check what we owe and what we're owed after the swap + hook delta
        int256 inputDelta = poolManager.currencyDelta(address(this), inputCurrency);
        int256 outputDelta = poolManager.currencyDelta(address(this), outputCurrency);

        // Settle input: transfer tokens from user to PoolManager
        if (inputDelta < 0) {
            uint256 amountToSettle = uint256(-inputDelta);
            poolManager.sync(inputCurrency);
            IERC20Minimal(Currency.unwrap(inputCurrency)).transferFrom(
                data.sender, address(poolManager), amountToSettle
            );
            poolManager.settle();
        }

        // Take output: transfer tokens from PoolManager to user
        uint256 amountOut = 0;
        if (outputDelta > 0) {
            amountOut = uint256(outputDelta);
            poolManager.take(outputCurrency, data.sender, amountOut);
        }

        return abi.encode(amountOut);
    }
}
