var host = {
    node: 'http://52.30.47.67:6869', // 'https://testnet.wavesexplorer.com/',
    matcher: 'http://52.30.47.67:6869'  // 'https://testnet.wavesexplorer.com/matcher'
};

WavesAPI.TESTNET_CONFIG.nodeAddress = host.node;
WavesAPI.TESTNET_CONFIG.matcherAddress = host.matcher;

const Waves = WavesAPI.create(WavesAPI.TESTNET_CONFIG);

var factor = 100000000;
var api = 'https://b4b76b19.ngrok.io';
var getUsersUrl = api + '/Auction/users ';
var getLotsUrl = api + '/Auction/lots';
var makeaBetUrl = api + '/Auction/bets';
var lotHistory = api + '/Auction/lots/{0}/users';
var closeLot = api + '/Auction/lots/{0}/finish';
var betsAllUrl  = api + '/Auction/betsall';
var activeBetsUrl = api + '/Auction/betsbyuser/{0}';

angular.module('app', [])
    .controller('appController', function ($scope, $http, $timeout) {
        let auction = waves.auth('banana note sea analyst room holiday shift armor crew easy pizza dad engage nest pioneer');

        $scope.activeUser = null;
        $scope.makeaBet = makeaBet;
        $scope.setActiveUser = setActiveUser;
        $scope.amount = 1;
        $scope.allBets = [];
        $scope.activeBets = [];
        $scope.newLot = {};

        $scope.ui = {
            nav: {
                lot:   'a.nav-link[href="#lot"]',
                bet:   'a.nav-link[href="#bets"]',
                myBet: 'a.nav-link[href="#myBet"]',
                myLot: 'a.nav-link[href="#myLot"]',
                win:   'a.nav-link[href="#win"]'
            },
            menu(e) {
              let nav = Object.values($scope.ui.nav);
              $scope.ui.onceClass(nav, e, 'active');
            },
            onceClass(items, e, name) {
              items.forEach(item => $(item).removeClass(name));
              $(e).addClass(name);
            }
        }

        $http.get(getUsersUrl).then(function (items) {
            $scope.users = items.data.map(function (item) {
                return {
                    id: item.Id,
                    name: item.Name,
                    wallet: waves.auth(item.Wallet)
                }
            });
            setActiveUser($scope.users[0]);
            console.log($scope.users);
        });

        $scope.userFromId = function(id) {
          return $scope.users
            ? $scope.users.filter(user => user.id === id)[0]
            : '';
        }

        $scope.getAllLots = function() {
            $http.get(getLotsUrl).then(function (items) {
                $scope.items = items.data.map(function (item) {
                    return {
                        id: item.Id,
                        img: item.Picture,
                        title: item.Title,
                        finished: item.Finished,
                        author: item.IdAuthor,
                        price: item.Price,
                        data: new Date(item.Timeofpost),
                        deadline: new Date(item.Deadline),
                        winneruserid: item.WinnerUserId
                    }
                });
            });
        }

        function getUserBalance(user) {
            return waves.balance(user.wallet)
                .then(balance => $timeout(function() {
                    user.balance = balance / factor;
                }, 0));
        }

        function makeaBet(amount, lotId) {
            $scope.loading = true;
            let user = $scope.activeUser;
            if (user.balance > 0) {
                waves.transfer(amount * factor, user.wallet, auction)
                    .then(transaction => {
                        console.log('ok', transaction);
                        return callApi(amount, lotId, transaction)
                            .then(_ => getUserBalance(user));
                    })
                    .catch(data => {
                        console.log('no!', data);
                    })
                    .then(() => {
                        $timeout(() => $scope.loading = false, 0);
                    });

                function callApi(amount, lotId, transaction) {
                    return $http.post(makeaBetUrl, {
                        BetOwner: user.id,
                        Amount: amount || 10,
                        Lot: lotId,
                        TransactionId: transaction.id
                    }).then(function () {
                        $scope.betAdded = true;
                        $timeout(function () {
                            $scope.betAdded = false;
                        }, 3000)
                    }).catch(function (error) {
                        console.log(error);
                    })
                }
            }

        }

        function setActiveUser(user) {
            $scope.activeUser = user;
            getUserBalance($scope.activeUser);
            $scope.getAllActiveBets();
        }

        $scope.betHistory = function(lot) { // lot = lot.id
            let url = lotHistory.replace('{0}', lot.id);
            $http.get(url).then(function({data}) {
                history(lot, data);
            });
        }

        $scope.closeLot = function(lot) {
          let url = closeLot.replace('{0}', lot.id);
          $http.post(url).then(function({data}) {
              $scope.getAllLots();
              history(lot, data);
          });
        }

        function history(lot, data) {
            $scope.history = data;
            $scope.showDrawer('lot-history');
        }

        $scope.drawer = '';
        $scope.showDrawer = function(article) {
            let toggle = $('#layer-drawer-controller-toggle');
            toggle.prop('checked', true);
            $scope.drawer = article;
        }
        $scope.hideDrawer = function() {
            let toggle = $('#layer-drawer-controller-toggle');
            toggle.prop('checked', false);
        }

        $scope.getAllBets = function() {
            $http.get(betsAllUrl).then(function({data}) {
                console.log(data);
                $timeout(function() {
                    $scope.allBets = data;
                }, 0)
            })
        }
        $scope.getAllActiveBets = function() {
            let url = activeBetsUrl.replace('{0}', $scope.activeUser.id);
            $http.get(url).then(function({data}) {
                console.log(data);
                $timeout(function() {
                    $scope.activeBets = data;
                }, 0);
            });
        }

        // init
        $scope.ui.menu($scope.ui.nav.lot);
        $scope.getAllLots();

        $scope.menuLots = function() {
            $scope.ui.menu($scope.ui.nav.lot);
            $scope.getAllLots()
        }

        $scope.menuBets = function() {
            $scope.ui.menu($scope.ui.nav.bet);
            $scope.getAllBets();
        }

        $scope.menuMyLots = function() {
            $scope.ui.menu($scope.ui.nav.myLot);
            $scope.getAllLots();
        }

        $scope.menuWin = function() {
            $scope.ui.menu($scope.ui.nav.win);
            $scope.getAllLots()
        }

        $scope.menuMyBets = function() {
            $scope.ui.menu($scope.ui.nav.myBet);
            $scope.getAllActiveBets();
        }

        $scope.createNewLot = function() {
            let newLot = Object.assign({}, $scope.newLot);
            if (!newLot.amount) return alert('Не задана стоимость лота');
            let date = new Date();
            let dead = new Date(date.getFullYear(), date.getMonth(), date.getDate() + newLot.duration);
            let data = {
                Price: newLot.amount,
                Title: newLot.title,
                IdAuthor: $scope.activeUser.id,
                Timeofpost: date,
                Deadline: dead,
                Picture: '8.jpg'
            }

            return $http.post(getLotsUrl, data)
                .then($scope.getAllLots)
                .then($scope.hideDrawer);
        }

    });
