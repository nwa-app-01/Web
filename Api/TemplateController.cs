using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Xml.Linq;

namespace Contracts.Api
{
    public class TemplateController : ApiController
    {
        Func<XElement, Object> selector = (e) => new { Id = e.Element("Id").Value, Text = e.Element("Description").Value };

        public TemplateController()
        {

        }

        [HttpGet]
        [ActionName("DefaultAction")]
        public HttpResponseMessage Get()
        {
            using (var context = new BusinessData.EFContracts())
            {
                var items = context
                    .DocumentTemplates
                    .ToArray()
                    .Select(r => ClientModels.DocumentTemplate.From(r));

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
                    .DocumentTemplates
                    .FirstOrDefault(r => r.Id == id);

                return Request.CreateResponse(HttpStatusCode.OK, ClientModels.DocumentTemplate.From(item));
            }
        }

        [HttpPost]
        [ActionName("DefaultAction")]
        public HttpResponseMessage Post(Contracts.Api.ClientModels.DocumentTemplate documentTemplate)
        {
            var response = Request.CreateResponse(HttpStatusCode.NotAcceptable);
            if (String.IsNullOrWhiteSpace(documentTemplate.TemplateName))
                return response;

            var templateDirectory = new DirectoryInfo(HttpContext.Current.Server.MapPath("~/Document Templates/"));

            using (var context = new BusinessData.EFContracts())
            {
                var now = DateTime.UtcNow;
                var entity = context.DocumentTemplates.Create();
                entity.Created = now;
                entity.TemplateName = Contracts.Code.Utils.CleanFileName(documentTemplate.TemplateName);
                entity.Location = templateDirectory.FullName;
                context.DocumentTemplates.Add(entity);

                DefaultTemplateFields_Genmed(context, now, entity);
                DefaultTemplateFields_Contract(context, now, entity);
                DefaultTemplateFields_Customer(context, now, entity);
                DefaultTemplateFields_Supplier(context, now, entity);

                context.SaveChanges();

                return Request.CreateResponse(HttpStatusCode.OK, ClientModels.DocumentTemplate.From(entity));
            }
        }


        // POST api/<controller>/5
        [HttpPost]
        [ActionName("Generate")]
        public HttpResponseMessage Generate(Int32 id)
        {
            var response = Request.CreateResponse(HttpStatusCode.Ambiguous);
            //var ids = (id ?? new Int32[]{}).Select(r => r.ToString()).ToArray();
            //if (ids.Any())
            //{
            //    var templateDirectory = new DirectoryInfo(HttpContext.Current.Server.MapPath("~/Document Templates/"));
            //    using (var file = System.IO.File.OpenRead(Path.Combine(templateDirectory.FullName, "Templates.xml")))
            //    {
            //        var root = XDocument.Load(file).Root;
            //        var items = root.Element("Templates").Elements("Template").Where(e => ids.Contains(e.Element("Id").Value)).Select(e => selector(e)).ToArray();
            //        return Request.CreateResponse(HttpStatusCode.OK, items);
            //    }
            //}
            return response;
        }

        static void DefaultTemplateFields_Genmed(BusinessData.EFContracts context, DateTime now, BusinessData.DocumentTemplate entity)
        {
            
            var documentTemplateSet = context.DocumentTemplateSets.Create();
            var documentTemplateFieldGroup = context.DocumentTemplateFieldGroups.FirstOrDefault(r => r.Name == "genmed");
            documentTemplateSet.DocumentTemplateFieldGroup = documentTemplateFieldGroup;
            documentTemplateSet.DocumentTemplate = entity;
            documentTemplateSet.Created = now;
            documentTemplateSet.Name = documentTemplateFieldGroup.Name;
            documentTemplateSet.SortOrder = documentTemplateFieldGroup.SortOrder;
            entity.DocumentTemplateSets.Add(documentTemplateSet);

            var documentTemplateField = context.DocumentTemplateFields.Create();
            documentTemplateField.Created = now;
            documentTemplateField.FieldName = "template-created-by";
            documentTemplateField.FieldDescription = "Template created by user";
            documentTemplateField.SortOrder = "99000";
            documentTemplateField.Type = typeof(String).Name;
            documentTemplateSet.DocumentTemplateFields.Add(documentTemplateField);

        }
        static void DefaultTemplateFields_Contract(BusinessData.EFContracts context, DateTime now, BusinessData.DocumentTemplate entity)
        {
            var documentTemplateSet = context.DocumentTemplateSets.Create();
            var documentTemplateFieldGroup = context.DocumentTemplateFieldGroups.FirstOrDefault(r => r.Name == "contract");
            documentTemplateSet.DocumentTemplateFieldGroup = documentTemplateFieldGroup;
            documentTemplateSet.DocumentTemplate = entity;
            documentTemplateSet.Created = now;
            documentTemplateSet.Name = documentTemplateFieldGroup.Name;
            documentTemplateSet.SortOrder = documentTemplateFieldGroup.SortOrder;
            entity.DocumentTemplateSets.Add(documentTemplateSet);

            BusinessData.DocumentTemplateField f = null; 
            f = context.DocumentTemplateFields.Create();
            f.Created = now;
            f.FieldName = "genmed-customer-contract-ref";
            f.FieldDescription = "Genmed Customer Contract Ref";
            f.SortOrder = "00000";
            f.Type = typeof(String).Name;
            documentTemplateSet.DocumentTemplateFields.Add(f);

            f = context.DocumentTemplateFields.Create();
            f.Created = now;
            f.FieldName = "genmed-supplier-contract-ref";
            f.FieldDescription = "Genmed Suppier Contract Ref";
            f.SortOrder = "00010";
            f.Type = typeof(String).Name;
            documentTemplateSet.DocumentTemplateFields.Add(f);

        }
        static void DefaultTemplateFields_Customer(BusinessData.EFContracts context, DateTime now, BusinessData.DocumentTemplate entity)
        {
            var documentTemplateSet = context.DocumentTemplateSets.Create();
            var documentTemplateFieldGroup = context.DocumentTemplateFieldGroups.FirstOrDefault(r => r.Name == "customer");
            documentTemplateSet.DocumentTemplateFieldGroup = documentTemplateFieldGroup;
            documentTemplateSet.DocumentTemplate = entity;
            documentTemplateSet.Created = now;
            documentTemplateSet.Name = documentTemplateFieldGroup.Name;
            documentTemplateSet.SortOrder = documentTemplateFieldGroup.SortOrder;
            entity.DocumentTemplateSets.Add(documentTemplateSet);

            var documentTemplateField = context.DocumentTemplateFields.Create();
            documentTemplateField.Created = now;
            documentTemplateField.FieldName = "customer-full-name";
            documentTemplateField.FieldDescription = "Customer Full Name";
            documentTemplateField.SortOrder = "00000";
            documentTemplateField.Type = typeof(String).Name;
            documentTemplateSet.DocumentTemplateFields.Add(documentTemplateField);

        }
        static void DefaultTemplateFields_Supplier(BusinessData.EFContracts context, DateTime now, BusinessData.DocumentTemplate entity)
        {
            var documentTemplateSet = context.DocumentTemplateSets.Create();
            var documentTemplateFieldGroup = context.DocumentTemplateFieldGroups.FirstOrDefault(r => r.Name == "supplier");
            documentTemplateSet.DocumentTemplateFieldGroup = documentTemplateFieldGroup;
            documentTemplateSet.DocumentTemplate = entity;
            documentTemplateSet.Created = now;
            documentTemplateSet.Name = documentTemplateFieldGroup.Name;
            documentTemplateSet.SortOrder = documentTemplateFieldGroup.SortOrder;
            entity.DocumentTemplateSets.Add(documentTemplateSet);

            var documentTemplateField = context.DocumentTemplateFields.Create();
            documentTemplateField.Created = now;
            documentTemplateField.FieldName = "supplier-full-name";
            documentTemplateField.FieldDescription = "Supplier Full Name";
            documentTemplateField.SortOrder = "00000";
            documentTemplateField.Type = typeof(String).Name;
            documentTemplateSet.DocumentTemplateFields.Add(documentTemplateField);

        }
    }
}