﻿using Auction.WebApi.Models;
using Auction.WebApi.StorageServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Auction.WebApi.Controllers
{
    [RoutePrefix("Auction")]
    public class AuctionController : ApiController
    {
        public AuctionService Service { get { return new AuctionService(); } }

        [Route("users")]
        public IEnumerable<UserContract> GetUsers()
        {
            return Service.GetUsers();
        }
        
        [HttpGet]
        [Route("lots")]
        public IEnumerable<LotContract> GetLot()
        {
            return Service.GetLots();
        }

        [HttpPost]
        [Route("lots")]
        public void AddLot(LotContract lot)
        {
            Service.CreateLot(lot);
        }

        [HttpPost]
        [Route("bets")]
        public void AddBet(BetContract bet)
        {
            var lot = Service.GetLots().FirstOrDefault(p => p.Id == bet.Lot);

            if (lot == null || lot.Finished)
                throw new Exception("Лот несуществует, либо завершён");

            Service.CreateBet(bet);
        }

        [HttpPost]
        [Route("lots/{lotid}/finish")]
        public IEnumerable<object> FinishLot(int lotId)
        {
            Service.FinishLot(lotId);

            var winBetId = Service.GetWinBet(lotId);

            if (winBetId.HasValue)
            {
                var bet = Service.GetBets(lotId).FirstOrDefault(p => p.Id == winBetId.Value);

                Service.SetWinnerBet(bet);
            }

            return GetLotUsers(lotId);
        }

        [Route("bets/{betId}")]
        public IEnumerable<BetContract> GetBet(int betId)
        {
            return Service.GetBets(betId);
        }

        [HttpGet]
        [Route("betsall")]
        public IEnumerable<BetContract> GetBets()
        {
            return Service.GetBets();
        }

        [HttpGet]
        [Route("betsbyuser/{userid}/lot/{lotid}")]
        public IEnumerable<BetContract> GetBetsbyUser(int userid, int lotid)
        {
            return Service.GetBetsByUser(userid, lotid);
        }

        [HttpGet]
        [Route("betsbyuser/{userid}")]
        public IEnumerable<BetContract> GetBetsbyUser(int userid)
        {
            return Service.GetBetsByUser(userid);
        }

        [Route("lots/{lotid}/users")]
        public IEnumerable<object> GetLotUsers(int lotId)
        {
            var bets = Service.GetBets(lotId);
            var users = Service.GetUsers();

            return (from bet in bets
                    let user = users.First(p => p.Id == bet.BetOwner)
                    select new
                    {
                        bet.Id,
                        bet.Amount, 
                        bet.Win, 
                        bet.TransactionId,
                        user
                    }
                    )
                    .OrderByDescending(p => p.Win)
                    .ThenByDescending(p => p.Id);
        }

        [HttpPost]
        [Route("bets/{betId}/settransactionid/{transactionid}")]
        public void SetBetTransactionId(int betId, string transactionid)
        {
            Service.SetBetTransactionId(betId, transactionid);
        }


    }
}