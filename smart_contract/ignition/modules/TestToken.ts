// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("TestTokenModule", (m) => {
  const initialSupply = m.getParameter("InitialSupply", 1000000);
  const testToken = m.contract("TestToken", [initialSupply]);

  return { testToken };
});
