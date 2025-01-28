import { expect } from "chai";
import { artifacts, ethers } from "hardhat";
import { Signer, Contract } from "ethers";
import { Create2, Erc1271Mock, UniversalSigValidator } from "../typechain-types";

describe("UniversalSigValidator", function () {

    const SALT = "0x0000000000000000000000000000000000000000000000000000000000000001";
    const MAGIC_BYTES = "6492649264926492649264926492649264926492649264926492649264926492";
    let owner: Signer;
    let ownerAddress: string;
    let validator: UniversalSigValidator;
    let erc1271Mock: Erc1271Mock;
    let create2: Create2;

    beforeEach(async function () {
        [owner] = await ethers.getSigners();
        ownerAddress = await owner.getAddress();

        const ValidatorFactory = await ethers.getContractFactory("UniversalSigValidator");
        validator = await ValidatorFactory.deploy();
        await validator.waitForDeployment();

        const ERC1271MockFactory = await ethers.getContractFactory("Erc1271Mock");
        erc1271Mock = await ERC1271MockFactory.deploy(ownerAddress);
        await erc1271Mock.waitForDeployment();

        const Create2Factory = await ethers.getContractFactory("Create2");
        create2 = await Create2Factory.deploy();
        await create2.waitForDeployment();
    });

    it("should validate a signature for a deployed contract", async function () {
        const message = "Hello, Ethereum!";
        const messageHash = ethers.hashMessage(message);
        const signature = await owner.signMessage(message);

        const isValid = await validator.isValidSig.staticCall(erc1271Mock, messageHash, signature);
        expect(isValid).to.true;
    });

    it("should validate a signature for an undeployed contract (counterfactual)", async function () {
        const message = "Hello, Ethereum!";
        const messageHash = ethers.hashMessage(message);
        const signature = await owner.signMessage(message);
        const artifact = await artifacts.readArtifact("Erc1271Mock");
        const erc1271MockBytecode = artifact.bytecode;

        const encodedArgs = ethers.AbiCoder.defaultAbiCoder().encode(['address'], [ownerAddress]);
        const initCode = ethers.concat([erc1271MockBytecode, encodedArgs]);
        const counterFactualAddressOfErc1271Mock = await create2.computeAddress(SALT, ethers.keccak256(initCode));

        // await create2.deploy(SALT, initCode);
        const factoryCalldata = create2.interface.encodeFunctionData("deploy", [SALT, initCode]);

        const create2Address = await create2.getAddress();
        const wrappedSignature = ethers.AbiCoder.defaultAbiCoder().encode(
            ["address", "bytes", "bytes"],
            [create2Address, factoryCalldata, signature]
        ) + MAGIC_BYTES;


        const isValid = await validator.isValidSig.staticCall(
            counterFactualAddressOfErc1271Mock,
            messageHash,
            wrappedSignature
        );

        expect(isValid).to.true;
    });
});
