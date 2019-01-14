require("dotenv").config();
let Web3 = require("web3");
let web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETH_Network));

let transferEth = (to, amount, HdWalletGenerator, index) => {
  amount = amount.toString();
  amount = web3.utils.toWei(amount, "ether");
  console.log({ to, amount });
  return new Promise((resolve, reject) => {
    if (!web3.utils.isAddress(to)) {
      reject("Invalid to address");
    } else {
      const from = HdWalletGenerator.getAddress(index).toString("hex");
      const privateKey =
        "0x" + HdWalletGenerator.getPrivateKey(index).toString("hex");
      web3.eth.getBalance(from).then(function(ethBalance) {
        if (Number(amount) > Number(ethBalance)) {
          reject("Insufficient Ether Balance");
        } else {
          web3.eth.getTransactionCount(from, "pending").then(function(count) {
            var tx = {
              from: from,
              to: to,
              value: amount,
              nonce: count
            };
            let gas;
            web3.eth.estimateGas(tx, function(err, estimatedGas) {
              if (!err) {
                gas = estimatedGas;
              } else {
                gas = 2100;
              }
              tx.gas = gas;
              web3.eth.getGasPrice().then(function(gasPrice) {
                if (2 * gasPrice * tx.gas > ethBalance - amount) {
                  reject("Insufficient Ether Balance For Gas");
                } else {
                  tx.gasPrice = 2 * gasPrice;
                  web3.eth.accounts
                    .signTransaction(tx, privateKey)
                    .then(async signed => {
                      var tran = await web3.eth.sendSignedTransaction(
                        signed.rawTransaction
                      );
                      resolve({ txnHash: tran.transactionHash });
                    });
                }
              });
            });
          });
        }
      });
    }
  });
};

module.exports = { transferEth };
