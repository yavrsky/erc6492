import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Create2Module", (m) => {
  const create2 = m.contract("Create2");
  return { create2 };
});
