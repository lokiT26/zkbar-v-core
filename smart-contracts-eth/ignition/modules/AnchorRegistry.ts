import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AnchorRegistryModule = buildModule("AnchorRegistryModule", (m) => {
  // Deploy the contract
  const anchorRegistry = m.contract("AnchorRegistry");

  // Return the deployed instance so we can interact with it
  return { anchorRegistry };
});

export default AnchorRegistryModule;
