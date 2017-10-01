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
                return db.ReadData<UserContract>("select id, name, wallet from users").ToList();
            }
        }

        internal IEnumerable<LotContract> GetLots()
        {
            using (var db = new DataRetriever(_connectionString))
            {
                return db.ReadData<LotContract>("select id, price, title, idauthor, timeofpost, deadline, picture from lots");
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
Lot
) values ((select max(id) + 1 from bets), 
@BetOwner,
@Amount,
@Win,
@Lot)", bet);
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

        internal IEnumerable<BetContract> GetBets(int lotId)
        {
            using (var db = new DataRetriever(_connectionString))
            {
                return db.ReadData<BetContract>($"select id, betowner, amount, win, lot from bets where lot = {lotId}");
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