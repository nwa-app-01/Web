using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using word = DocumentFormat.OpenXml.Wordprocessing;
using ds = DocumentFormat.OpenXml.CustomXmlDataProperties;
using System.IO;
using System.Xml.Linq;
using System.Xml;
using System.Xml.XPath;
using OpenXmlPowerTools;

namespace Contracts.Controllers
{
    public class DocumentController : Controller
    {
        
        //
        // GET: /Document/

        public ActionResult Index()
        {
            return View();
        }
        public ActionResult Edit(Int32? id)
        {
            return View(id);
        }
        public ActionResult Generate()
        {
            return View();
        }
        [HttpPost]
        public ActionResult Generate(Int32 documentId, Int32[] groupId)
        {
            CreateRealGenerated(documentId, groupId);
            //return new HttpStatusCodeResult(System.Net.HttpStatusCode.OK, "Document Created");
            return new JsonResult { Data = new { Id = documentId }, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
        }

        public ActionResult Data(Int32? id)
        {
            return View(id);
        }

        void CreateRealGenerated(Int32 documentId, Int32[] groupId)
        {
            dynamic generated = new ExpandoObject();
            var messages = new List<String>();
            generated.Messages = new[] { "(none)" };

            var name = String.Empty;
            var templateName = String.Empty;
            var ext = "docx";
            BusinessData.Document dataDocument = null;
            using (var context = new BusinessData.EFContracts())
            {
                dataDocument = context
                    .Documents
                    .Where(r => r.Id == documentId)
                    .FirstOrDefault();

                name = Contracts.Code.Utils.CleanFileName(dataDocument.DocumentName);
                templateName = Contracts.Code.Utils.CleanFileName(dataDocument.DocumentTemplate.TemplateName);
            }

            var templateDirectory = new DirectoryInfo(Server.MapPath("~/Document Templates/"));

            var documentCopyFileInfo = GetNextDocumentNo(templateDirectory, dataDocument);
            var xmlName = documentCopyFileInfo.Name.EndsWith("." + ext) ? documentCopyFileInfo.Name.Substring(0, documentCopyFileInfo.Name.Length - ext.Length) + "xml" : documentCopyFileInfo.Name + ".xml";
            
            messages.Add(String.Format("{0:u} {1} Starting generation", DateTime.Now, documentCopyFileInfo.Name));
            
            var documentFileInfo = new FileInfo(Path.Combine(templateDirectory.FullName, templateName + "." + ext));
            var xmlFileInfo = new FileInfo(Path.Combine(templateDirectory.FullName, xmlName));

            //var documentCopyFileInfo = new FileInfo(Path.Combine(templateDirectory.FullName, name + " " + id + ".docx"));
            //var documentCopyFileInfoBP = new FileInfo(Path.Combine(templateDirectory.FullName, "BP-" + name + " " + id + ".docx"));

            if (!documentFileInfo.Exists)
            {
                var defaultTemplateFileInfo = new FileInfo(Path.Combine(templateDirectory.FullName, "Default Template" + "." + ext));
                defaultTemplateFileInfo.CopyTo(documentFileInfo.FullName);
            }

            GenreateXmlForDocument(documentId, groupId, xmlFileInfo);
            using (var working = CreateFromTemplate(documentFileInfo))
            {
                working.Seek(0, 0);
                using (WordprocessingDocument document = WordprocessingDocument.Open(working, true))
                {

                    var storeItemId = CreateXmlSource(document, xmlFileInfo);
                    BindTables(document, storeItemId);
                    document.MainDocumentPart.Document.Save();
                }

                CopyToOutput(working, documentCopyFileInfo);

            }

            messages.Add(String.Format("{0:u} {1} Completed generation", DateTime.Now, documentFileInfo.FullName));
            generated.Messages = messages.ToArray();
        }

        #region Helpers 
        
        FileInfo GetNextDocumentNo(DirectoryInfo root, BusinessData.Document document)
        {
            Func<Int32, FileInfo> nameFactory = (n) => new FileInfo(System.IO.Path.Combine(root.FullName, String.Format("{0}.{1:000}.docx", document.DocumentName, n)));
            FileInfo proposedFileInfo = null;
            var proposedNo = 0;
            while ((proposedFileInfo = nameFactory(proposedNo)).Exists)
            {
                proposedNo++;
                if (proposedNo > 1000)
                    break;
            }
            return proposedFileInfo;
        }

        Boolean GenreateXmlForDocument(Int32 documentId, Int32[] groupId, FileInfo fileInfo)
        {
            XNamespace defaultNameSpace = "http://www.genmed.me.uk/2013/Templates/Contract/Merge/1";
            XNamespace xsiNameSpace = "http://www.w3.org/2001/XMLSchema-instance";

            var contract = new XElement("contract");
            using (var context = new BusinessData.EFContracts())
            {
                var item = context
                    .Documents
                    .FirstOrDefault(r => r.Id == documentId);

                var fieldGrouping = item
                    .DocumentFields
                    .Where(r => groupId.Contains(r.DocumentTemplateField.DocumentTemplateSetId))
                    .OrderBy(r => r.DocumentTemplateField.DocumentTemplateSet.SortOrder)
                    .ThenBy(r => r.DocumentTemplateField.DocumentTemplateSet.Name)
                    .GroupBy(r => r.DocumentTemplateField.DocumentTemplateSet.DocumentTemplateFieldGroup.Name);

                foreach (var fieldGroup in fieldGrouping)
                {
                    var fields = fieldGroup.Select(
                        f => new XElement(f.DocumentTemplateField.FieldName.Trim(), f.FieldValue)
                    ).ToArray();

                    contract.Add(
                        new XElement(fieldGroup.Key.Trim(), fields)
                    );
                }
            }

            var xml = new XDocument(
                new XElement("contract-merge",
                    new XAttribute(XNamespace.Xmlns + "contract-merge", defaultNameSpace),
                    new XAttribute("contract-merge", defaultNameSpace),
                    new XAttribute(XNamespace.Xmlns + "xsi", xsiNameSpace),
                    new XAttribute("xsi", xsiNameSpace),
                    contract
                )
            );

            using (var stream = fileInfo.OpenWrite())
            {
                xml.Save(stream);
            }

            return true;
        }
        void CopyToOutput(MemoryStream working, FileInfo outputFileInfo)
        {
            using (var output = outputFileInfo.OpenWrite())
            {
                working.Seek(0, 0);
                working.CopyTo(output);
                output.Flush();
                output.Close();
            }
        }
        MemoryStream CreateFromTemplate(FileInfo template)
        {
            var working = new MemoryStream();
            using (var orginial = template.Open(FileMode.Open, FileAccess.Read))
            {
                orginial.Seek(0, 0);
                orginial.CopyTo(working);
            }

            working.Seek(0, 0);
            return working;
        }
        WordprocessingDocument BindTables(WordprocessingDocument document, String storeItemId)
        {
            var marker = W.w + "tblCaption";
            var tableMarker = "/ns0:contract-merge";

            var mainDocumentPart = document.MainDocumentPart.GetXDocument();
            var body = mainDocumentPart.Descendants(W.body).FirstOrDefault();
            
            //get tables that should be bound
            var tablesToBind = 
                body
                .Descendants(W.tbl)
                .Where(t => t
                    .Descendants(W.tblPr)
                    .Descendants(marker)
                    .Attributes(W.val)
                    .Any(att => att.Value.StartsWith(tableMarker))
                ).ToList();

            var nsManager = new XmlNamespaceManager(new NameTable());
            var targetPrefix = "ns0";
            var targetNamespace = "http://www.genmed.me.uk/2013/Templates/Contract/Merge/1";
            nsManager.AddNamespace(targetPrefix, targetNamespace);

            //for each table 
            foreach (var tableToBind in tablesToBind)
            {
                //SECOND row is the template row
                var templateRow = tableToBind.Descendants(W.tr).Skip(1).FirstOrDefault();

                //get the source rows Path
                var sourceRowPath = tableToBind
                    .Descendants(W.tblPr)
                    .Descendants(marker)
                    .Attributes(W.val)
                    .FirstOrDefault()
                    .Value;

                var sourceRows = GetSourceXml(document, storeItemId).XPathSelectElements(sourceRowPath, nsManager).ToList();
                var rowNo = 1;
                foreach (var sourceRow in sourceRows)
                {
                    var row = new XElement(templateRow);
                    row = BuildRow(storeItemId, targetPrefix, targetNamespace, row, sourceRowPath, rowNo);
                    tableToBind.Add(row);
                    rowNo++;
                }
                templateRow.Remove();

            }

            //update the document with the new source
            document.MainDocumentPart.PutXDocument(mainDocumentPart);
            return document;
        }
        String CreateXmlSource(WordprocessingDocument document, FileInfo xmlFileInfo)
        {
            document.MainDocumentPart.DeleteParts<CustomXmlPart>(document.MainDocumentPart.CustomXmlParts);
            var customXmlPart = document.MainDocumentPart.AddCustomXmlPart(CustomXmlPartType.CustomXml);
            var result = PopulateCustomXmlPart("http://www.genmed.me.uk/2013/Templates/Contract/Merge/1", customXmlPart, xmlFileInfo);
            return result;
        }
        WordprocessingDocument CreateEmptyDocument(MemoryStream working)
        {
            working = working ?? new MemoryStream();
            var document = WordprocessingDocument.Create(new MemoryStream(), WordprocessingDocumentType.Document);
            var main = document.AddMainDocumentPart();
            main.Document = new word.Document(new word.Body());
            
            return document;
        }
        String PopulateCustomXmlPart(String uri, CustomXmlPart customXmlPart, FileInfo xmlFileInfo)
        {
            var customXmlPropertiesPart = customXmlPart.AddNewPart<CustomXmlPropertiesPart>("rId1");
            var result = GenerateCustomXmlPropertiesPart1Content(uri, customXmlPropertiesPart);

            using (FileStream stream = new FileStream(xmlFileInfo.FullName, FileMode.Open))
            {
                customXmlPart.FeedData(stream);
            }
            return result;
        }
        String GenerateCustomXmlPropertiesPart1Content(String uri, CustomXmlPropertiesPart customXmlPropertiesPart)
        {
            uri = "http://www.genmed.me.uk/2013/Templates/Contract/Merge/1";
            var itemId = Guid.NewGuid().ToString("B").ToUpper();
            var dataStoreItem = new ds.DataStoreItem() { ItemId = itemId };
            dataStoreItem.AddNamespaceDeclaration("ds", "http://schemas.openxmlformats.org/officeDocument/2006/customXml");

            var schemaReferences = new ds.SchemaReferences();
            var schemaReference = new ds.SchemaReference() { Uri = uri };

            schemaReferences.Append(schemaReference);
            dataStoreItem.Append(schemaReferences);

            customXmlPropertiesPart.DataStoreItem = dataStoreItem;

            return itemId;
        }
        static XDocument GetSourceXml(WordprocessingDocument document, String storeItemId)
        {
            var sourceCustomXmlPart = document.MainDocumentPart.CustomXmlParts.FirstOrDefault();
            return sourceCustomXmlPart.GetXDocument();
        }
        static XElement BuildRow(String storeItemId, string targetPrefix, string targetNamespace, XElement row, string sourceRowPath, int rowNo)
        {
            foreach (var target in row.Descendants(W.sdt).Descendants(W.sdtPr).Descendants(W.tag).Attributes(W.val).Select(a => a.Value).ToList())
            {
                XElement binding;
                var property = row.Descendants(W.sdt).Descendants(W.sdtPr).Where(t => t.Descendants(W.tag).Attributes(W.val).FirstOrDefault().Value == target).FirstOrDefault();
                if (!property.Descendants(W.dataBinding).Any())
                {
                    binding = new XElement(W.dataBinding,
                        new XAttribute(W.prefixMappings, String.Format("xmlns:{0}='{1}'", targetPrefix, targetNamespace)),
                        new XAttribute(W.xpath, sourceRowPath + String.Format("[{0}]/", rowNo) + target),
                        new XAttribute(W.storeItemID, storeItemId)
                    );

                    property.Add(binding);
                }
                else
                {
                    binding = property.Descendants(W.dataBinding).FirstOrDefault();
                    binding.Attributes(W.xpath).FirstOrDefault().SetValue(sourceRowPath + String.Format("[{0}]/", rowNo) + target);
                }
            }

            return row;
        }
        
        #endregion
    }
}
