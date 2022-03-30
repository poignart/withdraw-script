const { Contract, utils, Wallet, providers } = require("ethers");
require("dotenv").config();

const { PRIVATE_KEY, RPC_URL, CONTRACT_ADDRESS } = process.env;

if (!PRIVATE_KEY || !RPC_URL || !CONTRACT_ADDRESS) {
    console.error("Invalid ENV");
    process.exit(1);
}

const provider = new providers.JsonRpcProvider(RPC_URL);
const wallet = new Wallet(PRIVATE_KEY, provider);

const { address } = wallet;

const main = async () => {
    console.log("Trying withdrawAll on PoignART!");
    console.log({ address });
    const balance = await provider.getBalance(address);
    console.log({ balance: `${utils.formatEther(balance)} ETH` });
    const abi = new utils.Interface(["function withdrawAll() public"]);
    const contract = new Contract(CONTRACT_ADDRESS, abi, wallet);
    const tx = await contract.withdrawAll({
        gasLimit: 100000,
        gasPrice: utils.parseUnits("30", "gwei").toString(),
        type: 1,
        accessList: [
            {
                address: "0xd9db270c1b5e3bd161e8c8503c55ceabee709552", // gnosis safe implementation address
                storageKeys: [
                    "0x0000000000000000000000000000000000000000000000000000000000000000",
                ],
            },
            {
                address: "0x10E1439455BD2624878b243819E31CfEE9eb721C", // gnosis safe proxy address of unchain
                storageKeys: [
                    "0x0000000000000000000000000000000000000000000000000000000000000000",
                ],
            },
        ],
    });
    console.log({ txHash: tx.hash });
    await tx.wait();
    console.log("Withdraw Successful!");
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log("Withdraw Failed!");
        console.error(error);
        process.exit(1);
    });
