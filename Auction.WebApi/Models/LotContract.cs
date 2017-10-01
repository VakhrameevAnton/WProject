using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Auction.WebApi.Models
{
    public class LotContract
    {
        public int Id { get; set; }
        public int Price { get; set; }
        public string Title { get; set; }
        public int IdAuthor { get; set; }
        public string Timeofpost { get; set; }
        public string Deadline { get; set; }
        public string Picture { get; set; }
    }
}