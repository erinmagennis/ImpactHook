#!/bin/bash
# =============================================================================
# ImpactHook Live Demo
# =============================================================================

source .env 2>/dev/null

HOOK="0x6b3C6687e712c8f4AbA76362f73Ea2ef088b2044"
RPC="https://sepolia.unichain.org"
POOL_ID="0x1805022333a4a6845aad5145365255f8d8e58423271abc73978eae385b1e06f7"

# PoolKey for verifyMilestone calldata
# currency0=0x01, currency1=0x02, fee=3000, tickSpacing=60, hooks=HOOK
KEY_TUPLE="(0x0000000000000000000000000000000000000001,0x0000000000000000000000000000000000000002,3000,60,$HOOK)"

query_state() {
  local info=$(cast call $HOOK "getProjectInfo(bytes32)(address,address,uint256,uint256,uint16,bool)" $POOL_ID --rpc-url $RPC 2>/dev/null)
  local current=$(echo "$info" | sed -n '3p' | tr -d ' ')
  local total=$(echo "$info" | sed -n '4p' | tr -d ' ')
  local fee=$(echo "$info" | sed -n '5p' | tr -d ' ')
  echo "  Milestones: $current / $total verified"
  echo "  Fee tier:   $fee bps"
}

clear
echo ""
echo "  ImpactHook"
echo "  Clean Water - Chiapas Schools"
echo "  Unichain Sepolia"
echo ""
echo "  ────────────────────────────"
echo ""
query_state
echo ""
read -p "  [Enter to verify next milestone] "

echo ""
echo "  Verifying: 3-month water quality verified..."
cast send $HOOK "verifyMilestone((address,address,uint24,int24,address),uint256)" "$KEY_TUPLE" 2 --rpc-url $RPC --private-key $PRIVATE_KEY 2>&1 | grep -E "transactionHash" | sed 's/transactionHash/  tx/' || true
echo ""
query_state
echo ""
read -p "  [Enter to verify next milestone] "

echo ""
echo "  Verifying: Community management trained..."
cast send $HOOK "verifyMilestone((address,address,uint24,int24,address),uint256)" "$KEY_TUPLE" 3 --rpc-url $RPC --private-key $PRIVATE_KEY 2>&1 | grep -E "transactionHash" | sed 's/transactionHash/  tx/' || true
echo ""
query_state
echo ""
echo "  ────────────────────────────"
echo ""
echo "  All milestones verified."
echo "  Every fee, milestone, and withdrawal"
echo "  is on-chain and publicly verifiable."
echo ""
