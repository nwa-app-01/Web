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

    public class DocumentDataFieldGroupController : ApiController
    {
       
        [HttpGet]
        [ActionName("DefaultAction")]
        public HttpResponseMessage Get()
        {
            using (var context = new BusinessData.EFContracts())
            {
                var items = context
                    .DocumentTemplateFieldGroups
                    .ToArray();

                return Request.CreateResponse(HttpStatusCode.OK, items.Select(r=> ClientModels.Group.From(r)).ToArray());
            }

        }
    
    }
}