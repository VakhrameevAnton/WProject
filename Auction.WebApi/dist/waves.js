/** {Seed}
 * phrase: 'sdfsddfghjkhgfsdghjfdsfghjfdsfghjfdsfdfdghkjfdg',
 * address: '3Mw4dkb7CPmh6bwFqr7v5LoXPime29ELGQP',
 * keyPair: {
  *   privateKey: 'DSjuy5zbkDErmfq77RNYaytgMCBhryP5mieLbHugDSJm',
  *   publicKey: '5C3YTBVyyMQoNecv9soynZ8GJd5b82g2auFaPWJearKW'
  * }
 */

'use strict';

var waves = {
    /** Авторизация
     * @return {Seed}
     */
    auth: function auth(phrase) {
        return Waves.Seed.fromExistingPhrase(phrase);
    },

    /** перевод
     * @param {integer} amount
     * @param {Seed} from
     * @param {Seed} to
     * @return {Object} transaction
     */
    operation: function operation(amount, from, to) {
        var attachment = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];

        var data = {
            recipient: to.address,
            assetId: 'WAVES',
            amount: amount,
            feeAssetId: 'WAVES',
            fee: Math.ceil(amount / 100),
            attachment: attachment,
            timestamp: Date.now()
        };

        return waves.balance(from).then(function (balance) {
            if (balance < data.amount + data.fee) Promise.reject({ error: 'недостаточно средств' });
            return Waves.API.Node.v1.assets.transfer(data, from.keyPair);
        });
    },

    /** Баланс
     * @param {Seed} пользователь
     */
    balance: function balance(seed) {
        return Waves.API.Node.v1.addresses.balance(seed.address).then(function (_ref) {
            var balance = _ref.balance;
            return balance;
        });
    },

    /** Статус транзакции
     * @param {Object} transaction
     * @return {Promise} void
     */
    status: function status(transaction) {
        if (!transaction || !transaction.id) return Promise.reject();
        return Waves.API.Node.v1.transactions.get(transaction.id).then(function (_) {
            return Promise.resolve();
        })['catch'](function (_) {
            return Promise.reject();
        });
    },

    /** Перевод @API */
    transfer: function transfer(amount, from, to) {
        var attachment = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];

        return new Promise(function (resolve, reject) {
            return waves.operation(amount, from, to, attachment)['catch'](function (error) {
                return console.log('Ошибка', error);
            }).then(waves.timer).then(function (transaction) {
                return resolve(transaction);
            })['catch'](reject);
        });
    },

    /**
     * @param {any} transaction
     * @returns
     */
    timer: function timer(transaction) {
        console.log(transaction);
        return new Promise(function (resolve, reject) {
            var counter = 20;
            timeout();

            function timeout() {
                waves.status(transaction).then(function (_) {
                    return resolve(transaction);
                })['catch'](function (_) {
                    --counter;
                    console.log(counter);
                    if (counter === 0) reject(transaction);
                    setTimeout(timeout, 10000);
                });
            };
        });
    },

    /**
     * @param {Seed} user
     * @param {array} transactions? {array of transactionID:string}
     */
    list: function list(user) {
        var transactions = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

        return Waves.API.Node.v1.transactions.getList(user.address).then(function (data) {
            data = data[0];
            if (transactions.length === 0) return data;
            var list = data.filter(function (transaction) {
                return transactions.includes(transaction.id);
            });
            return list;
        });
    }
};
//# sourceMappingURL=waves.js.map