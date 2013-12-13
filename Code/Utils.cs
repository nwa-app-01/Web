using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Contracts.Code
{
    public static class Utils
    {
        public static String CleanFileName(String fileName)
        {
            var invalidChars = fileName.ToArray().Where(r => System.IO.Path.GetInvalidFileNameChars().Contains(r)).Select(r => r);
            if (invalidChars.Any())
            {
                foreach (var invalidChar in invalidChars)
                {
                    fileName = fileName.Replace(invalidChar, ' ');
                }
            }
            return fileName;
        }
    }
}