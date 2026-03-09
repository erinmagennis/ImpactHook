export const HOOK_ADDRESS = "0x6b3C6687e712c8f4AbA76362f73Ea2ef088b2044" as const;
export const ARBITER_ADDRESS = "0xfF42b8650B7C1957a60Dc1dc6133d30fBE20Bf63" as const;
export const ORACLE_ADDRESS = "0x9845d22Fbb33f30E241824aCB1813c041291A4Ca" as const;
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
  // Events
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
