import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "hardhat";
import * as dotenv from 'dotenv';
dotenv.config();

const Erc1271MockModule = buildModule("Erc1271MockModule", (m) => {
  const ownerAddress = process.env.ACCOUNT;
  if (!ownerAddress) {
    throw new Error("ACCOUNT environment variable is not defined");
  }

  const erc1271Mock = m.contract("Erc1271Mock", [ownerAddress]);

  return { erc1271Mock };
});

export default Erc1271MockModule;
