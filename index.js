const bip39 = require("bip39");
const HDKey = require("hdkey");
const EthereumBIP44 = require("./bip44");
const nemonic = bip39.generateMnemonic();
const seed = bip39.mnemonicToSeedHex(nemonic);
//console.log({ nemonic, seed });
const hdkey = HDKey.fromMasterSeed(Buffer.from(seed, "hex"));
//console.log({ hdkey });
let HdWalletGenerator = new EthereumBIP44(hdkey);

console.log(HdWalletGenerator.getAddress(0).toString("hex"));
console.log(HdWalletGenerator.getPrivateKey(0).toString("hex"));
