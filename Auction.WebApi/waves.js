/** {Seed}
 * phrase: 'sdfsddfghjkhgfsdghjfdsfghjfdsfghjfdsfdfdghkjfdg',
 * address: '3Mw4dkb7CPmh6bwFqr7v5LoXPime29ELGQP',
 * keyPair: {
  *   privateKey: 'DSjuy5zbkDErmfq77RNYaytgMCBhryP5mieLbHugDSJm',
  *   publicKey: '5C3YTBVyyMQoNecv9soynZ8GJd5b82g2auFaPWJearKW'
  * }
 */

let waves = {
    /** Авторизация
     * @return {Seed}
     */
    auth(phrase) {
        return Waves.Seed.fromExistingPhrase(phrase);
    },

    /** перевод
     * @param {integer} amount
     * @param {Seed} from
     * @param {Seed} to
     * @return {Object} transaction
     */
    operation(amount, from, to, attachment = '') {
        let data = {
            recipient: to.address,
            assetId: 'WAVES',
            amount,
            feeAssetId: 'WAVES',
            fee: Math.ceil(amount / 100),
            attachment,
            timestamp: Date.now()
        };

        return waves.balance(from)
            .then(balance => {
                if (balance < data.amount + data.fee) Promise.reject({error: 'недостаточно средств'});
                return Waves.API.Node.v1.assets.transfer(data, from.keyPair);
            })
    },

    /** Баланс
     * @param {Seed} пользователь
     */
    balance(seed) {
        return Waves.API.Node.v1.addresses.balance(seed.address)
            .then(({balance}) => balance);
    },

    /** Статус транзакции
     * @param {Object} transaction
     * @return {Promise} void
     */
    status(transaction) {
        if (!transaction || !transaction.id) return Promise.reject();
        return Waves.API.Node.v1.transactions.get(transaction.id)
            .then(_ => Promise.resolve())
            .catch(_ => Promise.reject())
    },

    /** Перевод @API */
    transfer(amount, from, to, attachment = '') {
        return new Promise(function (resolve, reject) {
            return waves.operation(amount, from, to, attachment)
                .catch(error => console.log('Ошибка', error))
                .then(waves.timer)
                .then(transaction => resolve(transaction))
                .catch(reject)
        });
    },

    /**
     * @param {any} transaction
     * @returns
     */
    timer(transaction) {
        console.log(transaction);
        return new Promise(function (resolve, reject) {
            let counter = 20;
            timeout();

            function timeout() {
                waves.status(transaction)
                    .then(_ => resolve(transaction))
                    .catch(_ => {
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
    list(user, transactions = []) {
        return Waves.API.Node.v1.transactions.getList(user.address)
            .then(data => {
                data = data[0];
                if (transactions.length === 0) return data;
                let list = data.filter(transaction => transactions.includes(transaction.id));
                return list;
            });
    }
};


