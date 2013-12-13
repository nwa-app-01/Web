using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

namespace Contracts.Api.ClientModels
{
    public class DocumentField
    {
        public static DocumentField From(BusinessData.DocumentField from)
        {
            var to = new DocumentField();
            to.Id = from.Id;
            to.Name = from.DocumentTemplateField.FieldName;
            to.Description = from.DocumentTemplateField.FieldDescription;
            to.Value = from.FieldValue;
            to.SortOrder = from.DocumentTemplateField.SortOrder;
            to.RV = System.Convert.ToBase64String(from.RV);

            return to;
        }

        public BusinessData.DocumentField Update(BusinessData.DocumentField update)
        {
            var rv = System.Convert.ToBase64String(update.RV);
            if (this.RV != rv)
                throw new ApplicationException("Unable to update entity as timestamps do not match");

            if (this.Id != update.Id)
                throw new ApplicationException("Unable to update entity as ids do not match");

            update.FieldValue = this.Value;
            update.RV = System.Convert.FromBase64String(this.RV);

            return update;
        }

        public Int32 Id { get; set; }
        public String Name { get; set; }
        public String Description { get; set; }
        public String Value { get; set; }
        public String RV { get; set; }
        public String SortOrder { get; set; }
    }

    public class DocumentTemplateField
    {
        public static DocumentTemplateField From(BusinessData.DocumentTemplateField from)
        {
            var to = new DocumentTemplateField();
            to.DocumentId = from.Id;
            to.GroupId = from.DocumentTemplateSetId;
            to.Name = from.FieldName;
            to.Description = from.FieldDescription;
            to.SortOrder = from.SortOrder;
            to.RV = System.Convert.ToBase64String(from.RV);

            return to;
        }

        public BusinessData.DocumentTemplateField Update(BusinessData.DocumentTemplateField update)
        {
            var rv = System.Convert.ToBase64String(update.RV);
            if (this.RV != rv)
                throw new ApplicationException("Unable to update entity as timestamps do not match");

            if (this.Id != update.Id)
                throw new ApplicationException("Unable to update entity as ids do not match");

            update.FieldName = this.Name;
            update.FieldDescription = this.Description;
            update.DocumentTemplateSetId = this.GroupId;
            update.SortOrder = this.SortOrder;
            update.RV = System.Convert.FromBase64String(this.RV);

            return update;
        }

        public Int32 Id { get; set; }
        public Int32 DocumentId { get; set; }
        public Int32 GroupId { get; set; }
        public String Name { get; set; }
        public String Description { get; set; }
        public String SortOrder { get; set; }
        public String RV { get; set; }
    }

    public class Group
    {
        public static Group From(BusinessData.DocumentTemplateFieldGroup from)
        {
            var to = new Group();
            to.Id = from.Id;
            to.Name = from.Name;
            to.SortOrder = from.SortOrder;
            return to;
        }

        public Int32 Id { get; set; }
        public String Name { get; set; }
        public String SortOrder { get; set; }
    }

    public class Document
    {
        public static Document From(BusinessData.Document from)
        {
            var to = new Document();
            to.Id = from.Id;
            to.Name = from.DocumentName;
            to.RV = System.Convert.ToBase64String(from.RV);

            return to;
        }

        public BusinessData.Document Update(BusinessData.Document update)
        {
            var rv = System.Convert.ToBase64String(update.RV);
            if (this.RV != rv)
                throw new ApplicationException("Unable to update entity as timestamps do not match");

            if (this.Id != update.Id)
                throw new ApplicationException("Unable to update entity as ids do not match");

            update.DocumentName = this.Name;
            update.RV = System.Convert.FromBase64String(this.RV);

            return update;
        }

        public Int32 Id { get; set; }
        public String Name { get; set; }
        public String RV { get; set; }
    }


    public class DocumentTemplate
    {
        public static DocumentTemplate From(BusinessData.DocumentTemplate from)
        {
            var to = new DocumentTemplate();
            to.Id = from.Id;
            to.TemplateName = from.TemplateName;
            to.Location = from.Location;
            to.RV = System.Convert.ToBase64String(from.RV);

            return to;
        }

        public BusinessData.DocumentTemplate Update(BusinessData.DocumentTemplate update)
        {
            var rv = System.Convert.ToBase64String(update.RV);
            if (this.RV != rv)
                throw new ApplicationException("Unable to update entity as timestamps do not match");

            if (this.Id != update.Id)
                throw new ApplicationException("Unable to update entity as ids do not match");

            update.TemplateName = this.TemplateName;
            update.Location = this.Location;
            update.RV = System.Convert.FromBase64String(this.RV);

            return update;
        }

        public Int32 Id { get; set; }
        public String TemplateName { get; set; }
        public String Location { get; set; }
        public String RV { get; set; }
    }

}