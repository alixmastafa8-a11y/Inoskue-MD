import axios from "axios";
import cheerio from "cheerio";
async function ghTrending() {
    try {
        const url = "https://github.com/trending";
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const repositories = [];
        $(".Box-row").each((index, element) => {
            const title = $(element).find("h2 a").text().trim().replace(/\s+/g, " ");
            const repoLink = "https://github.com" + $(element).find("h2 a").attr("href");
            const description = $(element).find("p").text().trim();
            const stars = $(element).find("a[href$='/stargazers']").text().trim();
            const numbers = $(element).find("a.Link--muted").map((i, el) => $(el).text().trim()).get();
            const forks = numbers.length > 1 ? numbers[1] : "0";
            const language = $(element).find("[itemprop='programmingLanguage']").text().trim();
            repositories.push({
                title,
                repoLink,
                description,
                stars,
                forks,
                language: language || "Unknown",
            });
        });
        return repositories;
    } catch (error) {
        return [];
    }
}
const handler = async (m, { conn }) => {
    try {
        const repos = await ghTrending();
        if (!repos.length) return m.reply("فشل to retrieve data from GitHub Trending.");
        let message = "GitHub Trending Today\n\n";
        repos.slice(0, 5).forEach((repo, index) => {
            message += `${index + 1}. ${repo.title}\n`;
            message += `Repository: ${repo.repoLink}\n`;
            message += `Stars: ${repo.stars} | Forks: ${repo.forks}\n`;
            message += `Language: ${repo.language}\n`;
            message += `Description: ${repo.description || "No description"}\n\n`;
        });
        await conn.sendMessage(m.chat, { text: message });
    } catch (error) {
        m.reply("حدث خطأ while retrieving GitHub Trending data.");
    }
};
handler.help = ["githubtrend"];
handler.tags = ["tools"];
handler.command = /^(githubtrend)$/i;
export default handler;