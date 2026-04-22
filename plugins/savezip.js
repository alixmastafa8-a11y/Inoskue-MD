import axios from 'axios';
async function saveweb2zip(url, options = {}) {
    if (!url) throw new Error('URL is required');
    url = url.startsWith('https://') ? url : `https://${url}`;
    const {
        renameAssets = false,
        saveStructure = false,
        alternativeAlgorithm = false,
        mobileVersion = false
    } = options;
    const { data } = await axios.post('https://copier.saveweb2zip.com/api/copySite', {
        url,
        renameAssets,
        saveStructure,
        alternativeAlgorithm,
        mobileVersion
    }, {
        headers: {
            accept: '*/*',
            'content-type': 'application/json',
            origin: 'https://saveweb2zip.com',
            referer: 'https://saveweb2zip.com/',
            'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
        }
    });
    while (true) {
        const { data: process } = await axios.get(`https://copier.saveweb2zip.com/api/getStatus/${data.md5}`, {
            headers: {
                accept: '*/*',
                'content-type': 'application/json',
                origin: 'https://saveweb2zip.com',
                referer: 'https://saveweb2zip.com/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
            }
        });
        if (process.isFinished) {
            return {
                url,
                error: {
                    text: process.errorText,
                    code: process.errorCode,
                },
                copiedFilesAmount: process.copiedFilesAmount,
                downloadUrl: `https://copier.saveweb2zip.com/api/downloadArchive/${process.md5}`
            }
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}
let handler = async (m, { conn, args }) => {
    if (!args[0]) {
        return m.reply('🧾 من فضلك أرسل رابط الموقع الذي تريد تحميله بصيغة ZIP.\nمثال: .savezip https://example.com');
    }
    try {
        m.reply('📥 جاري تحميل الموقع كملف ZIP، المرجو الانتظار...');
        const result = await saveweb2zip(args[0], { renameAssets: true });
        if (result.error.code !== 0) {
            return m.reply(`❌ خطأ: ${result.error.text || 'غير معروف'}`);
        }
        await conn.sendMessage(m.chat, {
            document: { url: result.downloadUrl },
            mimetype: 'application/zip',
            fileName: `Website.zip`,
            caption: `✅ تم حفظ الموقع بنجاح\n📄 عدد الملفات: ${result.copiedFilesAmount}\n🔗 الموقع: ${result.url}`
        }, { quoted: m });
    } catch (err) {
        console.error(err);
        m.reply('❌ حدث خطأ أثناء محاولة تحميل الموقع.');
    }
};
handler.help = ['savezip'];
handler.command = ['savezip'];
handler.tags = ['tools'];
handler.limit = true;
export default handler;