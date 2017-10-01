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
            Service.CreateBet(bet);
        }

        [Route("bets/{betId}")]
        public IEnumerable<BetContract> GetBet(int betId)
        {
            return Service.GetBets(betId);
        }
    }
}