using System;
using System.IO;
using System.Text;
using System.Collections.Specialized;
using System.Windows.Forms;
using System.Web.Script.Serialization;

class PdfClipboard {
    public class Request { public string pdf { get; set; } }
    [STAThread]
    static void Main(string[] args) {
        if (args.Length == 0 || args[0] != "chrome-extension://EXTENSION_ID/") return;
        bool ok = false;
        try {
            using (var input = new BinaryReader(Console.OpenStandardInput())) {
                int length = input.ReadInt32();
                if (length < 1 || length > 64 * 1024 * 1024) throw new InvalidDataException();
                var bytes = input.ReadBytes(length);
                if (bytes.Length != length) throw new EndOfStreamException();
                var parser = new JavaScriptSerializer { MaxJsonLength = length };
                var request = parser.Deserialize<Request>(Encoding.UTF8.GetString(bytes));
                var pdf = Convert.FromBase64String(request.pdf);
                if (pdf.Length < 8 || Encoding.ASCII.GetString(pdf, 0, 5) != "%PDF-") throw new InvalidDataException();
                var folder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "AI Relay", "PDF");
                Directory.CreateDirectory(folder);
                string path = Path.Combine(folder, "ChatGPT-" + DateTime.Now.ToString("yyyyMMdd-HHmmss") + "-" + Guid.NewGuid().ToString("N").Substring(0,8) + ".pdf");
                File.WriteAllBytes(path, pdf);
                var files = new StringCollection {path};
                var data = new DataObject();
                data.SetFileDropList(files);
                Clipboard.SetDataObject(data, true, 10, 100);
                ok = true;
            }
        } catch (Exception) { }
        using (var output = new BinaryWriter(Console.OpenStandardOutput())) {
            byte[] body = Encoding.UTF8.GetBytes(ok ? "{\"ok\":true}" : "{\"ok\":false}");
            output.Write(body.Length); output.Write(body); output.Flush();
        }
    }
}
