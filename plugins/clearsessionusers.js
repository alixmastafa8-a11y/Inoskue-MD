import fs from "fs";
import path from "path";
const handler = async (m, { conn }) => {
  const directory = "./sessions";
  function deleteFilesExceptOne(directory, fileNameToKeep) {
    fs.readdir(directory, (err, files) => {
      if (err) {
        console.error("There is an error:", err);
        return;
      }
      files.forEach((file) => {
        const filePath = path.join(directory, file);
        if (file !== fileNameToKeep) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`فشل to delete file ${file}:`, err);
            } else {
              console.log(`File ${file} deleted successfully.`);
            }
          });
        }
      });
    });
  }
  deleteFilesExceptOne(directory, "creds.json");
  m.reply("نجح Clear all sessions ✅ except one creds.json");
};
handler.command = handler.help = ["clearsessionusers"];
handler.tags = ["owner"];
handler.rowner = true;
export default handler;