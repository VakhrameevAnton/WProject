using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Auction.WebApi.Models
{
    public class UserContract
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Wallet { get; set; }
    }
}