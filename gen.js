const { mnemonicNew } = require("ton-crypto");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

function getLastNumberFromFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return 0;
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const match = fileContent.match(/№(\d+)/g);
    if (!match) {
        return 0;
    }

    const numbers = match.map((num) => parseInt(num.replace("№", ""), 10));
    return Math.max(...numbers);
}

// seed gen
async function createWallet(index) {
    const mnemonic = await mnemonicNew(24);

    const walletData = {
        number: index,
        mnemonic: mnemonic.join(" "),
        mnemonicArray: mnemonic,
    };

    return walletData;
}

// save to file
function saveWalletDataToFile(wallets, filePath) {
    const formattedData = wallets
        .map(
            (wallet) => `№${wallet.number}
Seed String:
${wallet.mnemonic}

Seed Array:
[${wallet.mnemonicArray.map((word) => `"${word}"`).join(", ")}]

-----
`
        )
        .join("\n");

    fs.appendFileSync(filePath, formattedData + "\n", "utf8");
    console.log(`All generated data saved to: ${filePath}`);
}


(async () => {
    try {

        const filePath = path.join(process.cwd(), "mnemonics.txt");

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        // how many to gen
        const count = await new Promise((resolve) =>
            rl.question("How many seed phrases would you like to generate? ", (answer) => {
                rl.close();
                resolve(parseInt(answer, 10) || 0);
            })
        );

        if (count <= 0) {
            console.log("Invalid input. Exiting.");
            return;
        }

        const lastNumber = getLastNumberFromFile(filePath);

        console.log(`Generating ${count} seed phrases starting from №${lastNumber + 1}...`);
        const wallets = [];
        for (let i = 1; i <= count; i++) {
            const wallet = await createWallet(lastNumber + i);
            wallets.push(wallet);

            console.log(`№${wallet.number}`);
            console.log(`Seed String: ${wallet.mnemonic}`);
            console.log(
                `Seed Array: [${wallet.mnemonicArray
                    .map((word) => `"${word}"`)
                    .join(", ")}]`
            );
        }

        saveWalletDataToFile(wallets, filePath);
    } catch (error) {
        console.error("ERROR generating seed phrases: ", error);
    }
})();
