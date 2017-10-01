using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Auction.WebApi.Models
{
    public class BetContract
    {
        public int Id { get; set; }
        public int BetOwner { get; set; }
        public int Amount { get; set; }
        public bool Win { get; set; }
        public int Lot { get; set; }
    }
}