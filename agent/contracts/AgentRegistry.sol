// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title AgentRegistry - Onchain registry for autonomous verification agents
/// @notice Deploys to Filecoin Calibration Testnet. Agents register identity,
///         store metadata/state CIDs on Filecoin, and build verifiable reputation
///         from their verification history.
contract AgentRegistry {
    struct AgentInfo {
        address operator;
        string name;
        string metadataCid;   // Points to Filecoin-stored agent.json
        string stateCid;      // Points to latest Filecoin-stored memory
        uint256 registeredAt;
        uint256 verificationsCompleted;
        uint256 verificationsApproved;
        uint256 lastActive;
        bool active;
    }

    mapping(address => AgentInfo) public agents;
    address[] public agentList;

    event AgentRegistered(address indexed agent, address indexed operator, string name, string metadataCid);
    event StateUpdated(address indexed agent, string stateCid, uint256 timestamp);
    event VerificationRecorded(address indexed agent, string poolId, uint256 milestoneIndex, bool approved, string reportCid);
    event AgentDeactivated(address indexed agent);

    modifier onlyRegistered() {
        require(agents[msg.sender].registeredAt > 0, "Agent not registered");
        _;
    }

    /// @notice Register a new agent with metadata stored on Filecoin
    /// @param name Human-readable agent name
    /// @param metadataCid CID of the agent.json capability manifest on Filecoin
    function registerAgent(string calldata name, string calldata metadataCid) external {
        require(agents[msg.sender].registeredAt == 0, "Already registered");
        require(bytes(name).length > 0, "Name required");

        agents[msg.sender] = AgentInfo({
            operator: msg.sender,
            name: name,
            metadataCid: metadataCid,
            stateCid: "",
            registeredAt: block.timestamp,
            verificationsCompleted: 0,
            verificationsApproved: 0,
            lastActive: block.timestamp,
            active: true
        });

        agentList.push(msg.sender);
        emit AgentRegistered(msg.sender, msg.sender, name, metadataCid);
    }

    /// @notice Update the agent's state CID (points to latest Storacha/Filecoin memory)
    /// @param stateCid CID of the latest agent memory/state on Filecoin
    function updateState(string calldata stateCid) external onlyRegistered {
        agents[msg.sender].stateCid = stateCid;
        agents[msg.sender].lastActive = block.timestamp;
        emit StateUpdated(msg.sender, stateCid, block.timestamp);
    }

    /// @notice Record a completed verification with its Filecoin report CID
    /// @param poolId The ImpactHook pool ID that was verified
    /// @param milestoneIndex The milestone index
    /// @param approved Whether the agent approved the evidence
    /// @param reportCid CID of the verification report on Filecoin
    function recordVerification(
        string calldata poolId,
        uint256 milestoneIndex,
        bool approved,
        string calldata reportCid
    ) external onlyRegistered {
        agents[msg.sender].verificationsCompleted++;
        if (approved) {
            agents[msg.sender].verificationsApproved++;
        }
        agents[msg.sender].lastActive = block.timestamp;
        emit VerificationRecorded(msg.sender, poolId, milestoneIndex, approved, reportCid);
    }

    /// @notice Deactivate the agent
    function deactivate() external onlyRegistered {
        agents[msg.sender].active = false;
        emit AgentDeactivated(msg.sender);
    }

    // --- View functions ---

    /// @notice Get the total number of registered agents
    function getAgentCount() external view returns (uint256) {
        return agentList.length;
    }

    /// @notice Get agent address by index
    function getAgentAt(uint256 index) external view returns (address) {
        return agentList[index];
    }

    /// @notice Get an agent's approval rate (0-100)
    function getApprovalRate(address agent) external view returns (uint256) {
        AgentInfo storage info = agents[agent];
        if (info.verificationsCompleted == 0) return 0;
        return (info.verificationsApproved * 100) / info.verificationsCompleted;
    }

    /// @notice Check if an agent is registered and active
    function isActive(address agent) external view returns (bool) {
        return agents[agent].active && agents[agent].registeredAt > 0;
    }
}
