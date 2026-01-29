import Web3 from "web3";

const web3 = new Web3("https://bsc-dataseed.binance.org/");

const tx = {
  blockHash: "0xdfa6a5790469d732a76a79234d7f088048d13d98681cfd94c61c7ae3d224ceb1",
  blockNumber: "0x2cd1da5",
  from: "0x093fd00da61b7cb1114dd8ea67d77af803d29d12",
  gas: "0x5258",
  gasPrice: "0x4fa639f87",
  hash: "0xdbdd13bc9ceaab96a62e3860225b61e430df5b0fcf2cd78c7b43841b6e6c99e3",
  input: "0x6d06bf6700000000",
  nonce: "0xb587",
  to: "0x093fd00da61b7cb1114dd8ea67d77af803d29d12",
  transactionIndex: "0x10",
  value: "0x0",
  type: "0x0",
  chainId: "0x38",
  v: "0x94",
  r: "0x4ea4aa59af725eef4eb12537156b559f4ee0233c49c7c8e208271924a67cd605",
  s: "0x486a1ead5ddf030fac368c78fef7e21f2b5b9b8e2c080b7353c3c3ed7494c8f3"
};

const abi = [
  {
    "constant": false,
    "inputs": [
      { "name": "param1", "type": "uint256" }
    ],
    "name": "myFunction",
    "outputs": [{ "name": "", "type": "bool" }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contract = new web3.eth.Contract(abi, "0x093fd00da61b7cb1114dd8ea67d77af803d29d12");

const decodedInput = web3.eth.abi.decodeParameters(
  [{ type: 'uint256', name: 'param1' }],
  tx.input.slice(10) 
);

console.log("Декодированные данные:", decodedInput);
