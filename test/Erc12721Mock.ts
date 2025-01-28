import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { Erc1271Mock } from "../typechain-types";

describe("Erc1271Mock", function () {
    let owner: Signer;
    let ownerAddress: string;
    let erc1271Mock: Erc1271Mock;

    beforeEach(async function () {
        [owner] = await ethers.getSigners();
        ownerAddress = await owner.getAddress();

        const Erc1271MockFactory = await ethers.getContractFactory("Erc1271Mock");
        erc1271Mock = (await Erc1271MockFactory.deploy(ownerAddress)) as Erc1271Mock;
        await erc1271Mock.waitForDeployment();
    });

    it("should validate a correct signature", async function () {
        const message = "Hello, Ethereum!";
        const messageHash = ethers.hashMessage(message);
        const signature = await owner.signMessage(message);

        const isValid = await erc1271Mock.isValidSignature(
            messageHash,
            signature
        );

        expect(isValid).to.equal("0x1626ba7e");
    });

});
