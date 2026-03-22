"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { HOOK_ADDRESS, impactHookAbi } from "../lib/contracts";
import { unichainSepolia } from "../lib/chains";

export interface DiscoveredProject {
  poolId: `0x${string}`;
  name: string;
  category: string;
  imageUrl: string;
  recipient: `0x${string}`;
  verifier: `0x${string}`;
  currentMilestone: bigint;
  milestoneCount: bigint;
  currentFeeBps: number;
  registered: boolean;
}

export function usePoolDiscovery() {
  // Step 1: Get total pool count
  const {
    data: poolCount,
    isLoading: countLoading,
    error: countError,
  } = useReadContract({
    address: HOOK_ADDRESS,
    abi: impactHookAbi,
    functionName: "getRegisteredPoolCount",
    chainId: unichainSepolia.id,
  });

  const count = poolCount ? Number(poolCount) : 0;

  // Step 2: Build multicall to fetch all pool IDs
  const poolIdCalls = Array.from({ length: count }, (_, i) => ({
    address: HOOK_ADDRESS as `0x${string}`,
    abi: impactHookAbi,
    functionName: "getRegisteredPool" as const,
    args: [BigInt(i)] as const,
    chainId: unichainSepolia.id,
  }));

  const {
    data: poolIdResults,
    isLoading: idsLoading,
  } = useReadContracts({
    contracts: poolIdCalls,
    query: { enabled: count > 0 },
  });

  // Extract pool IDs
  const poolIds: `0x${string}`[] = (poolIdResults ?? [])
    .filter((r) => r.status === "success" && r.result)
    .map((r) => r.result as `0x${string}`);

  // Step 3: Batch fetch project info + metadata for all pools
  const detailCalls = poolIds.flatMap((poolId) => [
    {
      address: HOOK_ADDRESS as `0x${string}`,
      abi: impactHookAbi,
      functionName: "getProjectInfo" as const,
      args: [poolId] as const,
      chainId: unichainSepolia.id,
    },
    {
      address: HOOK_ADDRESS as `0x${string}`,
      abi: impactHookAbi,
      functionName: "getProjectMetadata" as const,
      args: [poolId] as const,
      chainId: unichainSepolia.id,
    },
  ]);

  const {
    data: detailResults,
    isLoading: detailsLoading,
  } = useReadContracts({
    contracts: detailCalls,
    query: { enabled: poolIds.length > 0 },
  });

  // Step 4: Assemble projects
  const projects: DiscoveredProject[] = [];
  if (detailResults && poolIds.length > 0) {
    for (let i = 0; i < poolIds.length; i++) {
      const infoResult = detailResults[i * 2];
      const metaResult = detailResults[i * 2 + 1];

      if (infoResult?.status !== "success" || metaResult?.status !== "success") {
        continue;
      }

      const info = infoResult.result as readonly [
        `0x${string}`, // recipient
        `0x${string}`, // verifier
        bigint, // currentMilestone
        bigint, // milestoneCount
        number, // currentFeeBps
        boolean, // registered
      ];

      const meta = metaResult.result as readonly [
        string, // name
        string, // category
        string, // imageUrl
      ];

      if (!info[5]) continue; // skip unregistered

      projects.push({
        poolId: poolIds[i],
        recipient: info[0],
        verifier: info[1],
        currentMilestone: info[2],
        milestoneCount: info[3],
        currentFeeBps: Number(info[4]),
        registered: info[5],
        name: meta[0],
        category: meta[1],
        imageUrl: meta[2],
      });
    }
  }

  return {
    projects,
    poolIds,
    poolCount: count,
    isLoading: countLoading || idsLoading || detailsLoading,
    error: countError,
  };
}
