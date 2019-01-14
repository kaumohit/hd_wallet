require("dotenv").config();
let Web3 = require("web3");
let web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETH_Network));
const abi = require("../config/abi.json");

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

let transferErc = (to, amount, HdWalletGenerator, index, contractAddress) => {
  const contractInstance = new web3.eth.Contract(abi, contractAddress);
  contractInstance.setProvider(
    new Web3.providers.HttpProvider(process.env.ETH_Network)
  );
  amount = amount.toString();
  amount = web3.utils.toWei(amount, "ether");
  console.log({ to, amount });

  return new Promise((resolve, reject) => {
    if (!web3.utils.isAddress(to)) {
      reject("Invalid to address");
    } else {
      let encodedABI = contractInstance.methods
        .transfer(to, amount)
        .encodeABI();
      const from = HdWalletGenerator.getAddress(index).toString("hex");
      const privateKey =
        "0x" + HdWalletGenerator.getPrivateKey(index).toString("hex");
      let gas;
      web3.eth.getTransactionCount(from, "pending").then(function(count) {
        var tx = {
          from: from,
          to: contractAddress,
          data: encodedABI,
          nonce: count
        };
        web3.eth.estimateGas(tx, function(err, estimatedGas) {
          console.log({ estimatedGas });
          if (!err) {
            gas = estimatedGas + 1000;
          } else {
            gas = 52245;
          }
          tx.gas = gas;
          console.log({ tx });
          contractInstance.methods
            .balanceOf(from)
            .call()
            .then(function(balance) {
              console.log(balance);
              if (Number(amount) > Number(balance)) {
                reject("Insufficient coin Balance");
              } else {
                web3.eth.getBalance(from).then(function(balance) {
                  console.log({ balance });
                  web3.eth.getGasPrice().then(function(gasPrice) {
                    console.log({ gasPrice });
                    if (gasPrice * tx.gas > balance) {
                      reject("Insufficient Ether Balance");
                    } else {
                      web3.eth.accounts
                        .signTransaction(tx, privateKey)
                        .then(async signed => {
                          console.log(signed.rawTransaction);
                          var tran = await web3.eth.sendSignedTransaction(
                            signed.rawTransaction
                          );
                          resolve({ txnHash: tran.transactionHash });
                        });
                    }
                  });
                });
              }
            });
        });
      });
    }
  });
};

module.exports = { transferEth, transferErc };
