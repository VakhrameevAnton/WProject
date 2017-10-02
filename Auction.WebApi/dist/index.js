'use strict';

var host = {
    node: 'http://52.30.47.67:6869', // 'https://testnet.wavesexplorer.com/',
    matcher: 'http://52.30.47.67:6869' // 'https://testnet.wavesexplorer.com/matcher'
};

WavesAPI.TESTNET_CONFIG.nodeAddress = host.node;
WavesAPI.TESTNET_CONFIG.matcherAddress = host.matcher;

var Waves = WavesAPI.create(WavesAPI.TESTNET_CONFIG);

var factor = 10000000;
var api = 'https://b4b76b19.ngrok.io';
var getUsersUrl = api + '/Auction/users ';
var getLotsUrl = api + '/Auction/lots';
var makeaBetUrl = api + '/Auction/bets';

angular.module('app', []).controller('appController', function ($scope, $http, $timeout) {

    var user = waves.auth('segment monitor opinion fly erode true federal slow found pill laugh proud infant picnic scan');
    // 3N79JuKD2Eni2pxCeUEx7GEdrovncn3u8j5

    var auction = waves.auth('banana note sea analyst room holiday shift armor crew easy pizza dad engage nest pioneer');
    // 3NACVraZj4t7DytjMmz64QgSmGDKMmdrt1x

    waves.list(user, ['DuySf5DBeTu7aXxE9LdeD7Rrzo7qqpC4bYhFRb25qXFP', 'DFkVwVCHvFWN386t572ghJroJMck6fy8qdMxTsc7mz8c', '7ouiXv69bYHFvexXhQudxGEBdFyrNuFMvb9ZcK1vFXY6', 'Dnfvyuv1vA72TAkji5FpLe5z4rvKAjCBscMjhhHPK8Yn']).then(function (data) {
        return console.log('list', data);
    });

    $scope.activeUser = null;
    $scope.makeaBet = makeaBet;
    $scope.setActiveUser = setActiveUser;
    $scope.getUserBalanceAndName = getUserBalanceAndName;

    $http.get(getUsersUrl).then(function (items) {
        $scope.users = items.data.map(function (item) {
            return {
                id: item.Id,
                name: item.Name,
                wallet: waves.auth(item.Wallet)
            };
        });
        setActiveUser($scope.users[0]);
    });

    $http.get(getLotsUrl).then(function (items) {
        $scope.items = items.data.map(function (item) {
            return {
                id: item.Id,
                img: item.Picture,
                title: item.Title
            };
        });
    });

    function getUserBalance(user) {
        return waves.balance(user.wallet);
    }

    function makeaBet(amount, lotId) {
        $scope.loading = true;
        if ($scope.activeUser.balance > 0) {
            (function () {
                var callApi = function callApi(amount, lotId, transaction) {
                    return $http.post(makeaBetUrl, {
                        BetOwner: $scope.activeUser.id,
                        Amount: amount || 10,
                        Lot: lotId,
                        TransactionId: transaction.id
                    }).then(function () {
                        $scope.betAdded = true;
                        $timeout(function () {
                            $scope.betAdded = false;
                        }, 3000);
                    })['catch'](function (error) {
                        console.log(error);
                    });
                };

                waves.transfer(amount * factor, $scope.activeUser.wallet, auction).then(function (transaction) {
                    console.log('ok', transaction);
                    return callApi(amount, lotId, transaction);
                })['catch'](function (data) {
                    return console.log('no', data);
                }).then(function () {
                    $scope.loading = false;
                });
            })();
        }
    }

    function setActiveUser(user) {
        $scope.activeUser = user;

        getUserBalance($scope.activeUser).then(function (value) {
            $timeout(function () {
                $scope.activeUser.balance = value;
            }, 0);
        });
    }

    function getUserBalanceAndName(user) {
        return user.balance !== undefined ? user.name + ' Баланс: ' + user.balance : user.name;
    }
});
//# sourceMappingURL=index.js.map