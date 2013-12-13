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

    public class DocumentDataFieldController : ApiController
    {
        [ActionName("DefaultAction")]
        public HttpResponseMessage Get(Int32 id)
        {
            using (var context = new BusinessData.EFContracts())
	        {
                var item = context
                    .DocumentFields
                    .FirstOrDefault(r => r.Id == id);

                return Request.CreateResponse(HttpStatusCode.OK, ClientModels.DocumentField.From(item));
	        }
            
        }
        [ActionName("DefaultAction")]
        public HttpResponseMessage Put(Contracts.Api.ClientModels.DocumentField documentField)
        {
            using (var context = new BusinessData.EFContracts())
            {
                var item = context
                    .DocumentFields
                    .FirstOrDefault(r => r.Id == documentField.Id);

                documentField.Update(item);
                item.Updated = DateTime.UtcNow;
                var saved = context.SaveChanges();

                return Request.CreateResponse(HttpStatusCode.OK, ClientModels.DocumentField.From(item));
            }
        }

        [ActionName("DefaultAction")]
        public HttpResponseMessage Post(Contracts.Api.ClientModels.DocumentTemplateField documentTemplateField)
        {
            var response = Request.CreateResponse(HttpStatusCode.Conflict, documentTemplateField);
            using (var context = new BusinessData.EFContracts())
            {
                var document = context
                    .Documents
                    .FirstOrDefault(r => r.Id == documentTemplateField.DocumentId);

                if (document != null)
                {
                    var dataSet = document.DocumentTemplate.DocumentTemplateSets.FirstOrDefault(r => r.Id == documentTemplateField.GroupId);
                    
                    if (document.DocumentFields.Any(r => r.DocumentTemplateField.DocumentTemplateSetId == documentTemplateField.GroupId && r.DocumentTemplateField.FieldName == documentTemplateField.Name))
                    {
                        throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.Conflict, new HttpError("Template field name already exists")));
                    }

                    var entity = context.DocumentTemplateFields.Create();
                    entity.FieldName = (documentTemplateField.Name ?? "").Replace(" ", "-"); //space is not a valid xml name entity
                    entity.FieldDescription = documentTemplateField.Description;
                    entity.DocumentTemplateSetId = documentTemplateField.GroupId;
                    entity.Required = false;
                    entity.SortOrder = documentTemplateField.SortOrder;
                    entity.Type = typeof(String).Name;
                    entity.Created = DateTime.UtcNow;
                    context.DocumentTemplateFields.Add(entity);

                    var item = context.DocumentFields.Create();
                    item.DocumentId = document.Id;
                    item.DocumentTemplateFieldId = entity.Id;
                    item.Created = DateTime.UtcNow;
                    context.DocumentFields.Add(item);

                    var saved = context.SaveChanges();

                    return Request.CreateResponse(HttpStatusCode.OK, ClientModels.DocumentField.From(item));
                }
                else
                {
                    return response;
                }

            }
        }
           
    }
}