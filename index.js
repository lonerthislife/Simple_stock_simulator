const terminal = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const print = console.log;
const clear = console.clear;

const question = async (question) =>
  new Promise((resolve) => {
    terminal.question(question, (answer) => resolve(answer));
  });

let isTradeOn = true;
const stocks = [];
const trades = [];
const market = [];
const stockStorage = {};

const start = async () => {
  while (isTradeOn) {
    print("Menu");
    print("1. Buy Stocks");
    print("2. Sell Stocks");
    print("3. See Trades");
    print("4. Add Stocks");
    print("5. View Transactions");
    print("6. Exit");
    const choice = await question("Choice 1-6: ");
    print("\n");
    clear();
    try {
      switch (choice) {
        case "1":
          await buyStocks();
          break;
        case "2":
          await sellStocks();
          break;
        case "3":
          fetchTrades();
          break;
        case "4":
          await addStocks();
          break;
        case "5":
          if (market.length === 0) {
            print("No Transactions yet\n");
            break;
          }
          market.forEach((item, index) => {
            const { person, stock, qty, type, isTraded } = item;
            print(
              `${index + 1}. ${person}- ${type} - ${qty} of ${stock} ${
                isTraded ? "- TRADED" : ""
              }`.toUpperCase()
            );
          });
          break;
        default:
          isTradeOn = false;
      }
    } catch (error) {
      print("Trade Error");
    }
  }
  print("Trading is closed");
  process.exit(0);
};

start();

const checkTrade = ({ person, stock, qty }) => {
  const marketIndex = market.findIndex(
    (item) =>
      item.stock === stock &&
      item.qty === qty &&
      item.type === "SELL" &&
      !item.isTraded
  );

  if (marketIndex !== -1) {
    const { person: seller } = market[marketIndex];
    market[marketIndex].isTraded = true;
    trades.push({ buyer: person, seller, stock, qty });
    print("TRADE WAS MADE");
    return true;
  }
  return false;
};

const sellStocks = async () => {
  if (Object.keys(stockStorage).length === 0) {
    print("No Traders\n");
    return;
  }
  print("Traders");

  Object.keys(stockStorage).forEach((trader, index) => {
    print(`${index + 1}. ${trader}`);
  });
  let choice = await question(
    `Who are you? 1-${Object.keys(stockStorage).length}: `
  );
  const trader = Object.keys(stockStorage)[parseInt(choice) - 1];

  const stockers = stockStorage[trader];

  Object.keys(stockers).forEach((key, index) => {
    print(`${index + 1}. ${key} -> ${stockers[key]} stocks`);
  });

  choice = await question(`which stock? 1-${Object.keys(stockers).length} : `);
  const stock = Object.keys(stockers)[parseInt(choice) - 1];
  choice = await question("How Many?: ");
  const qty = parseInt(choice);

  if (qty > stockers[stock]) {
    print("Cannot sell more than you own");
    return;
  }

  stockStorage[trader][stock] -= qty;
  market.push({ type: "SELL", person: trader, stock, qty, isTraded: false });
};

const buyStocks = async () => {
  const buyer = await question("Who's the Buyer?: ");

  if (stocks.length === 0) {
    print("No Stocks yet\n");
    return;
  }
  print("Stocks Available");
  stocks.forEach((stock, index) => {
    print(`${index + 1}. ${stock}`);
  });
  print("\n");
  let stock = await question(`Which stock number? 1-${stocks.length} : `);
  stock = stocks[parseInt(stock) - 1];
  let qty = await question("How many Stocks?: ");
  qty = parseInt(qty);

  if (stockStorage[buyer]) {
    if (stockStorage[buyer][stock]) stockStorage[buyer][stock] += qty;
    else stockStorage[buyer][stock] = qty;
  } else stockStorage[buyer] = { [stock]: qty };

  print("\n");

  const isTraded = checkTrade({ person: buyer, stock, qty });

  market.push({ type: "BUY", person: buyer, stock, qty, isTraded });
};

const addStocks = async () => {
  while (true) {
    print("Stocks");
    if (stocks.length === 0) print("No Stocks yet\n");
    stocks.forEach((stock, index) => {
      print(`${index + 1}. ${stock}`);
    });
    print("\n");
    const newStock = await question("New Stock Name: ");
    if (stocks.indexOf(newStock.toLowerCase()) !== -1) {
      print("Already Exists\n");
    } else {
      stocks.push(newStock);
      break;
    }
  }
};

const fetchTrades = () => {
  print("Trades");
  if (trades.length === 0) {
    print("No Trades Yet\n");
    return;
  }
  trades.forEach((trade, index) => {
    const seller = trade.seller;
    const buyer = trade.buyer;
    const stock = trade.stock;
    const qty = trade.qty;
    print(
      `${index + 1}. ${buyer} traded ${qty} stocks of ${stock} from ${seller}`
    );
  });
  print("\n");
};
