export const HOOK_ADDRESS = "0x3D307ADF09d62D4F7CcF17C6dc329C339d696557" as const;
export const ARBITER_ADDRESS = "0x65B5661743765F135229e4901F214EE9A7b80181" as const;
export const ORACLE_ADDRESS = "0xDd5c349fb1dcc3Daf60cC7a5ff73175ef9567cBc" as const;
export const SWAP_ROUTER_ADDRESS = "0x66452162B01442d92fc77d607EE2Cff3e76043c2" as const;

export const impactSwapRouterAbi = [
  {
    type: "function",
    name: "swap",
    inputs: [
      {
        name: "key",
        type: "tuple",
        components: [
          { name: "currency0", type: "address" },
          { name: "currency1", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "tickSpacing", type: "int24" },
          { name: "hooks", type: "address" },
        ],
      },
      { name: "zeroForOne", type: "bool" },
      { name: "amountIn", type: "uint256" },
      { name: "minAmountOut", type: "uint256" },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "nonpayable",
  },
] as const;
export const EAS_ADDRESS = "0x4200000000000000000000000000000000000021" as const;
export const SCHEMA_REGISTRY = "0x4200000000000000000000000000000000000020" as const;
export const MILESTONE_SCHEMA_UID = "0xe4614a0cea117a9a198431d54972835ab8d84b8d6e3d18e482032377af9bfb52" as const;

export const impactHookAbi = [
  // Read functions
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "paused",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "callbackProxy",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "milestoneSchemaUID",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getProjectInfo",
    inputs: [{ name: "poolId", type: "bytes32" }],
    outputs: [
      { name: "recipient", type: "address" },
      { name: "verifier", type: "address" },
      { name: "currentMilestone", type: "uint256" },
      { name: "milestoneCount", type: "uint256" },
      { name: "currentFeeBps", type: "uint16" },
      { name: "registered", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCurrentFeeBps",
    inputs: [{ name: "poolId", type: "bytes32" }],
    outputs: [{ name: "", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMilestoneCount",
    inputs: [{ name: "poolId", type: "bytes32" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isMilestoneVerified",
    inputs: [
      { name: "poolId", type: "bytes32" },
      { name: "milestoneIndex", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "milestones",
    inputs: [
      { name: "", type: "bytes32" },
      { name: "", type: "uint256" },
    ],
    outputs: [
      { name: "description", type: "string" },
      { name: "projectFeeBps", type: "uint16" },
      { name: "verified", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "accumulatedFees",
    inputs: [
      { name: "", type: "bytes32" },
      { name: "", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  // Write functions
  {
    type: "function",
    name: "registerProject",
    inputs: [
      {
        name: "key",
        type: "tuple",
        components: [
          { name: "currency0", type: "address" },
          { name: "currency1", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "tickSpacing", type: "int24" },
          { name: "hooks", type: "address" },
        ],
      },
      { name: "recipient", type: "address" },
      { name: "verifier", type: "address" },
      { name: "name", type: "string" },
      { name: "category", type: "string" },
      { name: "descriptions", type: "string[]" },
      { name: "feeBpsValues", type: "uint16[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "verifyMilestone",
    inputs: [
      {
        name: "key",
        type: "tuple",
        components: [
          { name: "currency0", type: "address" },
          { name: "currency1", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "tickSpacing", type: "int24" },
          { name: "hooks", type: "address" },
        ],
      },
      { name: "milestoneIndex", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "verifyMilestoneEAS",
    inputs: [
      {
        name: "key",
        type: "tuple",
        components: [
          { name: "currency0", type: "address" },
          { name: "currency1", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "tickSpacing", type: "int24" },
          { name: "hooks", type: "address" },
        ],
      },
      { name: "attestationUID", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [
      { name: "poolId", type: "bytes32" },
      { name: "currency", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // Donate
  {
    type: "function",
    name: "donate",
    inputs: [
      { name: "poolId", type: "bytes32" },
      { name: "currency", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  // Impact tracking
  {
    type: "function",
    name: "getContributorStats",
    inputs: [
      { name: "contributor", type: "address" },
      { name: "poolId", type: "bytes32" },
    ],
    outputs: [
      { name: "poolContribution", type: "uint256" },
      { name: "globalContribution", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "globalContributions",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLoyaltyDiscount",
    inputs: [
      { name: "contributor", type: "address" },
      { name: "poolId", type: "bytes32" },
    ],
    outputs: [{ name: "discountBps", type: "uint16" }],
    stateMutability: "view",
  },
  // Pool discovery
  {
    type: "function",
    name: "getRegisteredPoolCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRegisteredPool",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
  // Contribution tracking
  {
    type: "function",
    name: "contributions",
    inputs: [
      { name: "", type: "address" },
      { name: "", type: "bytes32" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  // Evidence
  {
    type: "function",
    name: "milestoneEvidence",
    inputs: [
      { name: "", type: "bytes32" },
      { name: "", type: "uint256" },
    ],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setMilestoneEvidence",
    inputs: [
      { name: "poolId", type: "bytes32" },
      { name: "milestoneIndex", type: "uint256" },
      { name: "cid", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "EvidenceAttached",
    inputs: [
      { name: "poolId", type: "bytes32", indexed: true },
      { name: "milestoneIndex", type: "uint256", indexed: true },
      { name: "cid", type: "string", indexed: false },
    ],
  },
  // Project pause status
  {
    type: "function",
    name: "projectPaused",
    inputs: [{ name: "", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  // Project metadata
  {
    type: "function",
    name: "getProjectMetadata",
    inputs: [{ name: "poolId", type: "bytes32" }],
    outputs: [
      { name: "name", type: "string" },
      { name: "category", type: "string" },
      { name: "imageUrl", type: "string" },
    ],
    stateMutability: "view",
  },
  // Templates
  {
    type: "function",
    name: "templateCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTemplate",
    inputs: [{ name: "templateId", type: "uint256" }],
    outputs: [
      { name: "name", type: "string" },
      { name: "descriptions", type: "string[]" },
      { name: "feeBpsValues", type: "uint16[]" },
    ],
    stateMutability: "view",
  },
  // Events
  {
    type: "event",
    name: "Donated",
    inputs: [
      { name: "poolId", type: "bytes32", indexed: true },
      { name: "currency", type: "address", indexed: true },
      { name: "donor", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "ProjectRegistered",
    inputs: [
      { name: "poolId", type: "bytes32", indexed: true },
      { name: "recipient", type: "address", indexed: false },
      { name: "verifier", type: "address", indexed: false },
      { name: "milestoneCount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "MilestoneVerified",
    inputs: [
      { name: "poolId", type: "bytes32", indexed: true },
      { name: "milestoneIndex", type: "uint256", indexed: false },
      { name: "newFeeBps", type: "uint16", indexed: false },
    ],
  },
  {
    type: "event",
    name: "FeesAccumulated",
    inputs: [
      { name: "poolId", type: "bytes32", indexed: true },
      { name: "currency", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "FeesWithdrawn",
    inputs: [
      { name: "poolId", type: "bytes32", indexed: true },
      { name: "currency", type: "address", indexed: true },
      { name: "recipient", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;

export const easAbi = [
  {
    type: "function",
    name: "attest",
    inputs: [
      {
        name: "request",
        type: "tuple",
        components: [
          { name: "schema", type: "bytes32" },
          {
            name: "data",
            type: "tuple",
            components: [
              { name: "recipient", type: "address" },
              { name: "expirationTime", type: "uint64" },
              { name: "revocable", type: "bool" },
              { name: "refUID", type: "bytes32" },
              { name: "data", type: "bytes" },
              { name: "value", type: "uint256" },
            ],
          },
        ],
      },
    ],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "getAttestation",
    inputs: [{ name: "uid", type: "bytes32" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "uid", type: "bytes32" },
          { name: "schema", type: "bytes32" },
          { name: "time", type: "uint64" },
          { name: "expirationTime", type: "uint64" },
          { name: "revocationTime", type: "uint64" },
          { name: "refUID", type: "bytes32" },
          { name: "recipient", type: "address" },
          { name: "attester", type: "address" },
          { name: "revocable", type: "bool" },
          { name: "data", type: "bytes" },
        ],
      },
    ],
    stateMutability: "view",
  },
] as const;
