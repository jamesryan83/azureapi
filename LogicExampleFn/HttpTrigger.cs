using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.ServiceBus;
using Microsoft.Azure.ServiceBus.Core;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace LogicExampleFn
{
    public class HttpTrigger
    {
        private readonly LogicExampleContext _context;


        public HttpTrigger(LogicExampleContext context)
        {
            _context = context;
        }



        // ----------------------- SQL Database -----------------------


        [FunctionName("GetRows")]
        public IActionResult GetData(
            [HttpTrigger(AuthorizationLevel.Function, "get", Route = "rows")] HttpRequest req, ILogger log)
        {
            var postsArray = _context.ExampleData.OrderBy(p => p.Name).ToArray();

            return new OkObjectResult(postsArray);
        }


        [FunctionName("PostRow")]
        [Consumes("application/x-www-form-urlencoded")]
        public async Task<IActionResult> PostRowAsync(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = "row")] HttpRequest req,
            CancellationToken cts, ILogger log)
        {
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            ExampleRow data = JsonConvert.DeserializeObject<ExampleRow>(requestBody);

            if (data != null)
            {
                ExampleRow r = new ExampleRow
                {
                    Name = data.Name,
                    Description = data.Description
                };

                var entity = await _context.ExampleData.AddAsync(r, cts);
                await _context.SaveChangesAsync(cts);

                return new OkObjectResult(JsonConvert.SerializeObject(entity.Entity));
            }

            return new BadRequestObjectResult("Invalid inputs");
        }


        [FunctionName("ResetDatabase")]
        public async Task<IActionResult> ResetDatabase(
           [HttpTrigger(AuthorizationLevel.Function, "get", "post")] HttpRequest req, ILogger log)
        {
            var str = Environment.GetEnvironmentVariable("SqlConnectionString");
            using (SqlConnection conn = new SqlConnection(str))
            {
                conn.Open();
                var text = "DELETE FROM ExampleData WHERE Id > 5"; // leave a few rows

                using (SqlCommand cmd = new SqlCommand(text, conn))
                {
                    var rows = await cmd.ExecuteNonQueryAsync();
                    log.LogInformation($"{rows} rows were deleted");
                }
            }

            return new OkObjectResult("OK");
        }





        // ----------------------- Blob Storage -----------------------


        [FunctionName("PostImage")]
        public async Task<IActionResult> PostImage(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = "image")] HttpRequest req, ILogger log)
        {
            var str = Environment.GetEnvironmentVariable("BlobConnectionString");
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(str);

            var blobClient = storageAccount.CreateCloudBlobClient();
            var container = blobClient.GetContainerReference("images");

            var form = await req.ReadFormAsync();
            var image = form.Files[0];

            var blob = container.GetBlockBlobReference(image.FileName);
            blob.Properties.ContentType = image.ContentType;
            await blob.UploadFromStreamAsync(image.OpenReadStream());

            return new OkObjectResult("OK");
        }


        [FunctionName("ResetBlobStorage")]
        public async Task<IActionResult> ResetBlobStorage(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post")] HttpRequest req, ILogger log)
        {
            var str = Environment.GetEnvironmentVariable("BlobConnectionString");
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(str);

            var blobClient = storageAccount.CreateCloudBlobClient();
            var container = blobClient.GetContainerReference("images");

            BlobContinuationToken continuationToken = null;
            List<string> blobNames = new List<string>();

            try
            {
                do
                {
                    BlobResultSegment resultSegment = await container.ListBlobsSegmentedAsync(string.Empty,
                        true, BlobListingDetails.Metadata, null, continuationToken, null, null);

                    foreach (var blobItem in resultSegment.Results)
                    {
                        string name = ((CloudBlob)blobItem).Name;
                        if (name != "default.png")
                        {
                            blobNames.Add(name);
                        }
                    }

                    continuationToken = resultSegment.ContinuationToken;

                } while (continuationToken != null);

                foreach (var name in blobNames)
                {
                    CloudBlob blob = container.GetBlobReference(name);
                    await blob.DeleteIfExistsAsync();
                }
            }
            catch (StorageException e)
            {
                log.LogInformation("Error: " + e.Message);
                return new BadRequestObjectResult("Error deleting blobs");
            }

            return new OkObjectResult(JsonConvert.SerializeObject(blobNames));
        }



        // ----------------------- Service Bus -----------------------


        [FunctionName("ResetServiceBus")]
        public async Task<IActionResult> ResetServiceBus(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post")] HttpRequest req, ILogger log)
        {
            var str = Environment.GetEnvironmentVariable("ServiceBusConnectionString");
            var receiver = new MessageReceiver(str, "logicexample", ReceiveMode.ReceiveAndDelete);

            while (true)
            {
                try
                {
                    Message message = await receiver.PeekAsync();
                    if (message != null)
                    {
                        await receiver.ReceiveAsync();
                    }
                    else
                    {
                        break;
                    }
                }
                catch (ServiceBusException e)
                {
                    if (!e.IsTransient)
                    {
                        Console.WriteLine(e.Message);
                        throw;
                    }
                }
            }
            await receiver.CloseAsync();

            return new OkObjectResult("OK");
        }
    }
}
