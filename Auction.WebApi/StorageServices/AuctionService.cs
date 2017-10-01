using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using Auction.WebApi.Models;
using Npgsql;
using System.Data;
using Dapper;

namespace Auction.WebApi.StorageServices
{
    public class AuctionService
    {
        private string _connectionString;

        public AuctionService()
        {
            _connectionString = ConfigurationManager.ConnectionStrings["auctionldb"].ConnectionString;

            
        }

        internal IEnumerable<UserContract> GetUsers()
        {
            using (var db = new DataRetriever(_connectionString))
            {
                return db.ReadData<UserContract>("select * from users").ToList();
            }
        }

        internal IEnumerable<LotContract> GetLots()
        {
            using (var db = new DataRetriever(_connectionString))
            {
                return db.ReadData<LotContract>("select * from lots");
            }
        }

        internal void CreateBet(BetContract bet)
        {
            using (var db = new DataRetriever(_connectionString))
            {
                db.Execute(@"insert into bets (Id,
BetOwner,
Amount,
Win,
Lot,
transactionid
) values ((select max(id) + 1 from bets), 
@BetOwner,
@Amount,
@Win,
@Lot,
@transactionid)", bet);
            }
        }

        internal void FinishLot(int lotId)
        {
            using (var db = new DataRetriever(_connectionString))
            {
                db.Execute(@"update lots set finished = true where id = @lotId", new { lotId });
            }
        }

        internal int? GetWinBet(int lotId)
        {
            var sql = $@"select amount, max(id) as id, count(*) 
from bets 
where lot = {lotId}
group by amount
having count(*) = 1
order by 1 asc
limit 1";

            using (var db = new DataRetriever(_connectionString))
            {
                var res = db.ReadData<WinBetInfo>(sql).ToList();

                return res.FirstOrDefault()?.Id;
            }
        }

        internal void CreateLot(LotContract log)
        {
            using (var db = new DataRetriever(_connectionString))
            {
                db.Execute(@"insert into lots (id, Price,
Title,
IdAuthor,
Timeofpost,
Deadline,
Picture) values((select max(id) + 1 from lots), @Price,
@Title,
@IdAuthor,
@Timeofpost,
@Deadline,
@Picture)", log);
            }
        }

        internal void SetWinnerBet(BetContract winBet)
        {
            using (var db = new DataRetriever(_connectionString))
            {
                db.Execute($"update lots set winneruserid = @BetOwner where id = @Lot", winBet);
                db.Execute($"update bets set win = true where id = @Id", winBet);
            }
        }

        internal void SetBetTransactionId(int betId, string transactionid)
        {
            using (var db = new DataRetriever(_connectionString))
            {
                db.Execute($"update bets set transactionId = @transactionid where id = @betId", new { betId, transactionid });
            }
        }

        internal IEnumerable<BetContract> GetBets(int lotId)
        {
            using (var db = new DataRetriever(_connectionString))
            {
                return db.ReadData<BetContract>($"select * from bets where lot = {lotId}");
            }
        }

        public class DataRetriever : IDisposable
        {
            private readonly IDbConnection dbConnection;

            public DataRetriever(string connectionString)
            {
                dbConnection = new NpgsqlConnection(connectionString);
                dbConnection.Open();
            }

            public IEnumerable<T> ReadData<T>(string query) where T : class
            {
                using (var reader = dbConnection.ExecuteReader(query))
                {
                    do
                    {
                        var item = reader.Parse<T>().FirstOrDefault();

                        if (item != null)
                            yield return item;
                        else
                        {       
                            break;
                        }
                    } while (true);
                }
            }

            public void Execute(string query, object param)
            {
                dbConnection.Execute(query, param);
            }

            public void Dispose()
            {
                dbConnection.Close();
            }
        }
    }
}