const {
  addPlayer,
  deletePlayer,
  updatePlayerBet,
  getPlayerBalance,
  getAllPlayersBalance,
} = require('./usecases');

async function handleCommands(message, prefix, channelName, client) {
  if (message.channel.type === 'dm' && message.author.bot == false) {
    _handleAddPlayer(message);
    return;
  }

  message.channel = client.channels.cache.find(
    (channel) => channel.name === channelName
  );

  if (message.content.search(`${prefix}addplayer`) == 0) {
    message.author.send(
      ':small_orange_diamond: To add a new player, send me a private message with the NAME, API KEY, SECRET API KEY, BET \n' +
        ":small_orange_diamond: You can get your API key from your binance account (on binance API management, check only 'Enable Reading', 'Enable Futures' and 'Unrestricted IP access') \n" +
        ':small_orange_diamond: Example : \n' +
        '**John XX XX 100**'
    );
  }

  if (message.content.search(`${prefix}delete`) == 0)
    _handleDeletePlayer(message, prefix);

  if (message.content.search(`${prefix}setbet`) == 0)
    _handleSetBet(message, prefix);

  if (message.content.search(`${prefix}balance`) == 0)
    await _handleBalanceCommand(message, prefix);
}

function _extractDataFromCommand(message, prefix, command) {
  const args = message.content.replace(`${prefix}${command} `, '');
  return args.split(' ');
}

function _normalizeName(name) {
  return name.charAt(0).toUpperCase() + name.substring(1).toLowerCase();
}

function _handleAddPlayer(message) {
  const args = message.content;
  const arg = args.split(' ');
  const name = _normalizeName(arg[0]);
  const apiKey = arg[1];
  const secretKey = arg[2];
  const bet = arg[3];

  if (arg[0] == null || arg[1] == null || (arg[2] == null) | (arg[3] == null)) {
    message.author
      .send('**:warning: Wrong format :warning:**')
      .catch((err) => {});
    message.author
      .send(
        "**:point_right: Try : addplayer 'player name'  'public key'  'secret key'  'player bet'**"
      )
      .catch((err) => {});
    return;
  }

  try {
    const player = addPlayer({ name, apiKey, secretKey, bet });
    message.author
      .send(
        '** :white_check_mark: name : **' +
          player.name +
          '\n' +
          '** :white_check_mark: api_key : **' +
          player.apiKey +
          '\n' +
          '** :white_check_mark: secret_key : **' +
          player.secretKey +
          '\n' +
          '** :white_check_mark: bet : **' +
          player.bet
      )
      .catch((err) => {});
  } catch (e) {
    message.author
      .send(`**:warning: Player creation failure : ${e.message} :warning:**`)
      .catch((err) => {});
  }
}

function _handleDeletePlayer(message, prefix) {
  const data = _extractDataFromCommand(message, prefix, 'delete');
  const playerName = _normalizeName(data[0]);

  try {
    deletePlayer({ playerName });
    message.channel.send(
      `**:white_check_mark: ${playerName} deleted :white_check_mark:**`
    );
  } catch (e) {
    message.channel.send('**:warning: Player name unknown :warning:**');
  }
}

function _handleSetBet(message, prefix) {
  const data = _extractDataFromCommand(message, prefix, 'setbet');
  const playerName = _normalizeName(data[0]);
  const bet = data[1];

  try {
    const { message: messageToSend } = updatePlayerBet({ playerName, bet });
    message.channel.send(messageToSend);
  } catch (e) {
    message.channel.send(`**:warning: Error: ${e.message} :warning:**`);
  }
}

async function _handlePlayerBalance(message, playerName) {
  try {
    const messages = await getPlayerBalance({ playerName });
    messages.forEach((msg) => message.channel.send(msg));
  } catch (e) {
    message.channel.send(
      '**:warning: Error balance, are the API keys valid? :warning:**'
    );
  }
}

async function _handlePlayersBalance(message) {
  try {
    const messages = await getAllPlayersBalance();
    messages.forEach((msg) => message.channel.send(msg));
  } catch (e) {
    message.channel.send(`**:warning: Error: ${e.message} :warning:**`);
  }
}

async function _handleBalanceCommand(message, prefix) {
  const data = _extractDataFromCommand(message, prefix, 'balance');
  const playerName = _normalizeName(data[0]);

  if (data[0] !== 'all') await _handlePlayerBalance(message, playerName);
  else await _handlePlayersBalance(message);
}

module.exports = {
  handleCommands,
};
