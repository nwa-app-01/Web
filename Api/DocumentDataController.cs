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
    public class DocumentDataController : ApiController
    {
        [HttpGet]
        [ActionName("DefaultAction")]
        public HttpResponseMessage Get()
        {
            using (var context = new BusinessData.EFContracts())
            {
                var items = context
                    .Documents
                    .ToArray()
                    .Select(r => ClientModels.Document.From(r));

                return Request.CreateResponse(HttpStatusCode.OK, items);
            }
        }

        [HttpGet]
        [ActionName("DefaultAction")]
        public HttpResponseMessage Get(Int32 id)
        {
            using (var context = new BusinessData.EFContracts())
	        {
                var item = context
                    .Documents
                    .FirstOrDefault(r => r.Id == id);

                return Request.CreateResponse(HttpStatusCode.OK, ClientModels.Document.From(item));
	        }
        }

        [HttpPost]
        [ActionName("Update")]
        public HttpResponseMessage Update(ClientModels.DocumentField update)
        {
            using (var context = new BusinessData.EFContracts())
            {
                var item = context
                    .DocumentFields
                    .FirstOrDefault(r => r.Id == update.Id);

                update.Update(item);
                context.SaveChanges();

                return Request.CreateResponse(HttpStatusCode.OK, ClientModels.DocumentField.From(item));
            }
        }

        [HttpGet]
        [ActionName("DataSet")]
        public HttpResponseMessage DataSet(Int32 id)
        {
            using (var context = new BusinessData.EFContracts())
            {
                var items = context.DocumentFields.Where(f => f.DocumentTemplateField.DocumentTemplateSetId == id).ToArray();

                return Request.CreateResponse(HttpStatusCode.OK, items.Select(r => ClientModels.DocumentField.From(r)).ToArray());
            }
        }

        [HttpPost]
        [ActionName("DataSet")]
        //Create new data set from the group id posted 
        public HttpResponseMessage DataSet(Int32 id, ClientModels.Group group)
        {
            var now = DateTime.Now;
            

            var error = ValidateDataSetPost(id, group);
            if (!String.IsNullOrWhiteSpace(error))
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.Conflict, new HttpError(error)));
            }


            var groupName = (group.Name ?? "").Trim();
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Conflict);
            if (group != null && !String.IsNullOrWhiteSpace(groupName))
            {
                using (var context = new BusinessData.EFContracts())
                {
                    var documentTemplateFieldGroups = context.DocumentTemplateFieldGroups.FirstOrDefault(r => r.Id == group.Id);
                    
                    if (documentTemplateFieldGroups != null)
                    {
                        
                        var document = context.Documents.FirstOrDefault(r => r.Id == id);
                        if (document != null)
                        {
                            var dataSet = new BusinessData.DocumentTemplateSet
                            {
                                DocumentTemplateFieldGroupId = group.Id,
                                Created = now,
                                Updated = now,
                                SortOrder = group.SortOrder,
                                Name = group.Name
                            };
                            
                            //add the new template set
                            document.DocumentTemplate.DocumentTemplateSets.Add(dataSet);
                            //copy the template items from the old set to the new
                            var documentTemplateSet = documentTemplateFieldGroups.DocumentTemplateSets.FirstOrDefault();
                            if (documentTemplateSet != null)
                            {

                                var copy = document.DocumentFields.Where(r => r.DocumentTemplateField.DocumentTemplateSetId == documentTemplateSet.Id).ToArray();
                                foreach (var df in copy)
                                {
                                    var f = new BusinessData.DocumentField
                                    {
                                        DocumentTemplateField = new BusinessData.DocumentTemplateField
                                        {
                                            Created = DateTime.UtcNow,
                                            Updated = DateTime.UtcNow,
                                            DocumentTemplateSet = dataSet,
                                            FieldName = df.DocumentTemplateField.FieldName,
                                            FieldDescription = df.DocumentTemplateField.FieldDescription,
                                            SortOrder = df.DocumentTemplateField.SortOrder,
                                            Type = df.DocumentTemplateField.Type,
                                            Regex = df.DocumentTemplateField.Regex,
                                            Required = df.DocumentTemplateField.Required
                                        },
                                        Created = DateTime.UtcNow,
                                        Updated = DateTime.UtcNow
                                    };
                                    document.DocumentFields.Add(f);

                                }
                                                         
                            }
                            context.SaveChanges();
                            var items = context.DocumentFields.Where(f => f.DocumentTemplateField.DocumentTemplateSetId == id).ToArray();

                            response = Request.CreateResponse(HttpStatusCode.OK, items.Select(r => ClientModels.DocumentField.From(r)).ToArray());
                        }
                    }
                }
            }
            else
            {
                var errors = new List<String>();
                if (group == null)
                    errors.Add("Group was not specified");

                if (String.IsNullOrWhiteSpace(groupName))
                    errors.Add("Group Name was not specified");

                response = Request.CreateErrorResponse(HttpStatusCode.Conflict, "Unable to create group");
            }
            return response;
        }

        [HttpGet]
        [ActionName("DataSets")]
        public HttpResponseMessage DataSets(Int32 id) //the document id
        {
            using (var context = new BusinessData.EFContracts())
            {
                
                var document = context
                    .Documents.Where(r => r.Id == id)
                    .FirstOrDefault();

                var items = new Object[] { };
                if (document != null)
                {
                    items = document
                        .DocumentTemplate
                        .DocumentTemplateSets
                        .OrderBy(r => r.SortOrder)
                        .ThenBy(r => r.Name)
                        .Select(r => new { r.Id, r.Name, r.SortOrder, r.RV })
                        .ToArray();
                }
                return Request.CreateResponse(HttpStatusCode.OK, items);
            }
        }

        [HttpPost]
        [ActionName("DataSets")]
        public HttpResponseMessage DataSets(Int32 id, ClientModels.DocumentTemplateField fieldTemplate)
        {
            using (var context = new BusinessData.EFContracts())
            {

                var now = DateTime.UtcNow;
                var entity = context
                    .Documents
                    .FirstOrDefault(r => r.Id == id);

                var documentTemplateSet = context.DocumentTemplateSets.Create();
                var documentTemplateFieldGroup = context.DocumentTemplateFieldGroups.FirstOrDefault(r => r.Id == fieldTemplate.GroupId);
                documentTemplateSet.DocumentTemplateFieldGroup = documentTemplateFieldGroup;
                documentTemplateSet.DocumentTemplate = entity.DocumentTemplate;
                documentTemplateSet.Created = now;
                documentTemplateSet.Name = documentTemplateFieldGroup.Name;
                documentTemplateSet.SortOrder = documentTemplateFieldGroup.SortOrder;
                entity.DocumentTemplate.DocumentTemplateSets.Add(documentTemplateSet);

                context.SaveChanges();
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [ActionName("DefaultAction")]
        public HttpResponseMessage Post(Contracts.Api.ClientModels.DocumentTemplate documentTemplate)
        {
            var response = Request.CreateResponse(HttpStatusCode.Conflict, documentTemplate);
            using (var context = new BusinessData.EFContracts())
            {
                
                var template = context
                    .DocumentTemplates
                    .FirstOrDefault(r => r.Id == documentTemplate.Id);

                if (template != null)
                {
                    var now = DateTime.UtcNow;
                    var document = context.Documents.Create();
                    document.Created = now;
                    document.DocumentTemplateId = template.Id;
                    context.Documents.Add(document);
                    var name = String.IsNullOrWhiteSpace(documentTemplate.TemplateName) ? template.TemplateName : documentTemplate.TemplateName;
                    Func<Int32, String> nameFactory = (n) => String.Format("{0}.{1:000}", name, n);
                    var proposedName = nameFactory(template.Next);
                    while(context.Documents.Any(r => r.DocumentName == proposedName))
                    {
                        template.Next++;
                        proposedName = nameFactory(template.Next);
                    }
                    document.DocumentName = proposedName;
                    var wellKnownFields = new Dictionary<String, List<String>> { 
                        { "genmed", new List<String> { "genmed-template-created-by" } } ,
                        { "contract", new List<String> { "genmed-customer-contract-ref", "genmed-supplier-contract-ref" } },
                        { "customer", new List<String> { "customer-full-name" } },
                        { "supplier", new List<String> { "supplier-full-name" } }

                    };

                    var xs = document.DocumentTemplate.DocumentTemplateSets.Join(wellKnownFields, o => o.Name, i => i.Key, (o, i) => o.DocumentTemplateFields).ToArray();

                    foreach (var documentTemplateFields in document.DocumentTemplate.DocumentTemplateSets.Join(wellKnownFields, o => o.Name, i => i.Key, (o, i) => o.DocumentTemplateFields))
                    {
                        foreach (var documentTemplateField in documentTemplateFields)
                        {
                            var documentField = context.DocumentFields.Create();
                            documentField.Created = now;
                            documentField.DocumentTemplateField = documentTemplateField;
                            documentField.Document = document;

                            if (documentTemplateField.FieldName == "genmed-template-created-by")
                            {
                                documentField.FieldValue = System.Threading.Thread.CurrentPrincipal.Identity.Name;
                            }

                            context.DocumentFields.Add(documentField);
                        }
                    }

                    var saved = context.SaveChanges();

                    return Request.CreateResponse(HttpStatusCode.OK, ClientModels.Document.From(document));
                }
                else
                {
                    return response;
                }

            }
        }

        String ValidateDataSetPost(Int32 id, ClientModels.Group group)
        {
            var errors = new List<String>();
            if (group == null)
                errors.Add("Group was not specified");

            var groupName = (group.Name ?? "").Trim();

            if (String.IsNullOrWhiteSpace(groupName))
                errors.Add("Group Name was not specified");


            if (!errors.Any())
            {

                using (var context = new BusinessData.EFContracts())
                {
                    var exists = context.DocumentTemplateSets.Any(r => r.Name == groupName && r.DocumentTemplate.Documents.Any(d => d.Id == id));
                    if(exists)
                    {
                        errors.Add("Group Name exists");
                    }
    
                }
            }

            return errors.Aggregate("", (a, s) => a + s);        
        }
    }
}