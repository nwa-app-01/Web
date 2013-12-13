using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Http;
using System.Xml.Linq;

namespace Contracts.Api
{
    public class DocumentController : ApiController
    {
        [HttpGet]
        [ActionName("DefaultAction")]
        public HttpResponseMessage Get()
        {
            using (var context = new BusinessData.EFContracts())
            {
                var items = context
                    .DocumentFields
                    .Select(r => new { 
                        Id = r.DocumentId, 
                        GroupId = r.DocumentTemplateField.DocumentTemplateSetId, 
                        DocumentName = r.Document.DocumentName,
                        r.DocumentTemplateField.DocumentTemplateSet.Name }
                    )
                    .Distinct();

                return Request.CreateResponse(HttpStatusCode.OK, items.ToArray());
            }
        }

    }
}