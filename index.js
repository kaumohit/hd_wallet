const bip39 = require("bip39");
const HDKey = require("hdkey");
const EthereumBIP44 = require("./utils/bip44");
const nemonic = bip39.generateMnemonic();
const seed = bip39.mnemonicToSeedHex(nemonic);
const transferEth = require("./controllers/transfer").transferEth;
const transferErc = require("./controllers/transfer").transferErc;

const hdkey = HDKey.fromMasterSeed(Buffer.from(seed, "hex"));
let HdWalletGenerator = new EthereumBIP44(hdkey);

let index = 0;
let to = "0xDc7bE2963B1e8A4A3732F023cD51362B69aB547d";
let amount = 0.0001;
let contractAddress = "0xfad1e9465ff23f2f9ead26efff161a5274a7d5ed";
(async () => {
  try {
    //let txnData = await transferEth(to, amount, HdWalletGenerator, index);
    let txnData = await transferErc(
      to,
      amount,
      HdWalletGenerator,
      index,
      contractAddress
    );
    console.log(txnData);
  } catch (er) {
    console.log("Transaction errored due to some reason!!!");
    console.log(er);
  }
})();
