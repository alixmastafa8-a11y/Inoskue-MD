import axios from 'axios';

const appTeka = {
    api: {
        base: 'https://appteka.store',
        endpoint: {
            search: '/api/1/app/search',
            userApps: '/api/1/user/app/list',
            appInfo: '/api/1/app/info',
            userProfile: '/api/2/user/profile'
        }
    },

    headers: {
        'content-type': 'application/json',
        'user-agent': 'Postify/1.0.0'
    },

    utils: {
        formatSize: bytes => {
            if (bytes === 0) return '0 Byte';
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return `${Math.round(bytes / Math.pow(1024, i))} ${['Bytes', 'KB', 'MB', 'GB'][i]}`;
        },

        formatTime: timestamp => new Date(timestamp * 1000).toLocaleDateString(),

        extractId: (url, type) => {
            const match = url?.match(new RegExp(`/${type}/([^/]+)$`));
            return match?.[1] || null;
        },

        isUrl: (input, type) => {
            if (!input) return { valid: false, error: `Come on, the ${type} input is empty! 😐` };
            
            if (type === 'search') {
                return input.length < 2 ? {
                    valid: false,
                    error: "Seriously, what are you searching for? That input is way too short! 😂"
                } : { valid: true, query: input };
            }

            const urlType = type === 'info' ? 'app' : type === 'apps' ? 'profile' : type;
            const id = appTeka.utils.extractId(input, urlType);
            return id ? { valid: true, id } : {
                valid: false,
                error: `The ${type} link you entered isn't valid! It should look like: https://appteka.store/${urlType}/[ID] 😂`
            };
        },

        res: (response, type) => {
            if (!response?.data || response.status !== 200) {
                const e = {
                    search: "Couldn't find any apps, bro! 😐",
                    info: "That app doesn't exist, man! 😂",
                    profile: "Who are you looking for? There's no profile data! 😂",
                    apps: "This user hasn't uploaded any apps yet, dude! 😂"
                };

                return {
                    success: false,
                    code: response?.status || 400,
                    result: {
                        error: response?.status === 404 ? 
                            e[type] :
                            response?.status === 429 ?
                            "Chill out, you're sending too many requests! 😂" :
                            "Something went wrong! 😐"
                    }
                };
            }
            return null;
        },

        parse: (data, type) => {
            const types = {
                app: app => ({
                    appId: app.app_id,
                    appName: app.label,
                    package: app.package,
                    version: {
                        name: app.ver_name,
                        code: app.ver_code
                    },
                    stats: {
                        downloads: app.downloads,
                        rating: app.rating
                    },
                    metadata: {
                        size: appTeka.utils.formatSize(app.size),
                        rawSize: app.size,
                        uploadTime: appTeka.utils.formatTime(app.time),
                        timestamp: app.time
                    },
                    category: {
                        id: app.category?.id,
                        name: app.category?.name
                    },
                    developer: {
                        userId: app.user_id
                    },
                    status: {
                        fileStatus: app.file_status,
                        exclusive: app.exclusive,
                        source: `${appTeka.api.base}/app/${app.app_id}`
                    }
                }),

                info: meta => ({
                    appInfo: {
                        size: meta.info.size,
                        sha1: meta.info.sha1,
                        time: meta.info.time,
                        label: meta.info.label,
                        package: meta.info.package,
                        version: {
                            name: meta.info.ver_name,
                            code: meta.info.ver_code
                        },
                        sdkVersion: meta.info.sdk_version,
                        permissions: meta.info.permissions,
                        downloads: meta.info.downloads,
                        downloadTime: meta.info.download_time,
                        favorites: meta.info.favorites,
                        userId: meta.info.user_id,
                        username: meta.info.user_name,
                        appId: meta.info.app_id,
                        fileStatus: meta.info.file_status,
                        android: meta.info.android
                    },
                    metadata: {
                        whatsNew: meta.meta.whats_new,
                        description: meta.meta.description,
                        category: {
                            id: meta.meta.category?.id,
                            names: meta.meta.category?.name
                        },
                        exclusive: meta.meta.exclusive,
                        time: meta.meta.time,
                        rating: {
                            average: meta.meta.rating,
                            count: meta.meta.rate_count,
                            scores: meta.meta.scores
                        },
                        tags: meta.meta.tags,
                        screenshots: meta.meta.screenshots
                    },
                    versions: meta.versions?.map(version => ({
                        appId: version.app_id,
                        version: {
                            name: version.ver_name,
                            code: version.ver_code
                        },
                        downloads: version.downloads,
                        sdkVersion: version.sdk_version
                    })),
                    download: {
                        link: meta.link,
                        expiresIn: meta.expires_in
                    },
                    web: meta.url
                }),

                profile: profile => ({
                    userId: profile.user_id,
                    name: profile.name,
                    joinTime: profile.join_time,
                    lastSeen: profile.last_seen,
                    stats: {
                        role: profile.role,
                        mentorId: profile.mentor_id,
                        filesCount: profile.files_count,
                        totalDownloads: profile.total_downloads,
                        favoritesCount: profile.favorites_count,
                        reviewsCount: profile.reviews_count,
                        feedCount: profile.feed_count,
                        pubsCount: profile.pubs_count,
                        subsCount: profile.subs_count
                    },
                    status: {
                        isRegistered: profile.is_registered,
                        isVerified: profile.is_verified,
                        isSubscribed: profile.is_subscribed
                    },
                    lastReviews: profile.last_reviews?.map(review => ({
                        file: {
                            appId: review.file.app_id,
                            fileStatus: review.file.file_status,
                            size: review.file.size,
                            time: review.file.time,
                            label: review.file.label,
                            package: review.file.package,
                            version: {
                                name: review.file.ver_name,
                                code: review.file.ver_code
                            },
                            downloads: review.file.downloads,
                            userId: review.file.user_id,
                            rating: review.file.rating,
                            exclusive: review.file.exclusive
                        },
                        rating: {
                            rateId: review.rating.rate_id,
                            userId: review.rating.user_id,
                            username: review.rating.user_name,
                            time: review.rating.time,
                            score: review.rating.score,
                            text: review.rating.text
                        }
                    })) || [],
                    url: profile.url,
                    name_regex: profile.name_regex || null,
                    access_list: profile.access_list || [],
                    grant_roles: profile.grant_roles || []
                })
            };

            return types[type](data);
        }
    },

    request: async (input, type, offset = 0, locale = 'en', count = 20) => {
        try {
            const validation = appTeka.utils.isUrl(input, type);
            if (!validation.valid) {
                return {
                    success: false,
                    code: 400,
                    result: { error: validation.error }
                };
            }

            const endpoints = {
                search: {
                    url: appTeka.api.endpoint.search,
                    params: { query: validation.query, offset, locale, count },
                    parser: data => ({
                        query: validation.query,
                        params: { offset, locale, count },
                        total: data.entries?.length || 0,
                        apps: data.entries?.map(app => appTeka.utils.parse(app, 'app')) || []
                    })
                },
                info: {
                    url: appTeka.api.endpoint.appInfo,
                    params: { app_id: validation.id },
                    parser: data => appTeka.utils.parse(data, 'info')
                },
                profile: {
                    url: appTeka.api.endpoint.userProfile,
                    params: { user_id: validation.id },
                    parser: data => appTeka.utils.parse(data.profile, 'profile')
                },
                apps: {
                    url: appTeka.api.endpoint.userApps,
                    params: { user_id: validation.id, offset, locale, count },
                    parser: data => ({
                        profile_link: input,
                        params: { userId: validation.id, offset, locale, count },
                        total: data.entries?.length || 0,
                        apps: data.entries?.map(app => appTeka.utils.parse(app, 'app')) || []
                    })
                }
            };

            const endpoint = endpoints[type];
            const response = await axios.get(`${appTeka.api.base}${endpoint.url}`, {
                params: endpoint.params,
                headers: appTeka.headers,
                validateStatus: false
            });

            const error = appTeka.utils.res(response, type);
            if (error) return error;

            return {
                success: true,
                code: 200,
                result: endpoint.parser(response.data.result)
            };

        } catch (error) {
            return {
                success: false,
                code: error?.response?.status || 400,
                result: {
                    error: error?.response?.data?.message || error.message || "Something went wrong! 😐"
                }
            };
        }
    }
};

let handler = async (m, { conn, text }) => {
    if (!text) {
        return conn.reply(m.chat, `Enter the command with the format:\n\n*appteka <type> <input>*\nExamples:\n\n- *appteka search WhatsApp*\n\n- *appteka info https://appteka.store/app/f11r218089*`, m);
    }

    const [typeRaw, ...inputParts] = text.trim().split(' ');
    const type = typeRaw.toLowerCase();
    const input = inputParts.join(' ');

    const validTypes = ['search', 'info', 'profile', 'apps'];
    if (!validTypes.includes(type)) {
        return conn.reply(m.chat, `Invalid type!\nUse one of: *${validTypes.join(', ')}*`, m);
    }

    if (!input) {
        const example = type === 'search' ? 'WhatsApp' : (type === 'info' || type === 'download' || type === 'dl' ? 'https://appteka.store/app/12345' : 'https://appteka.store/profile/67890');
        return conn.reply(m.chat, `Enter an input for type *${type}*\nExample: *appteka ${type} ${example}*`, m);
    }

    try {
        const response = await appTeka.request(input, type);
        if (!response.success) {
            return conn.reply(m.chat, response.result?.error || 'An error occurred while fetching data.', m);
        }

        const result = response.result;
        let replyText = '';

        switch (type) {
            case 'search':
                replyText = `Search results for "${result.query}":\nTotal: ${result.total}\n`;
                result.apps.forEach(app => {
                    replyText += `\n- *${app.appName}* (${app.package})\n  Version: ${app.version.name}\n  Size: ${app.metadata.size}\n  Downloads: ${app.stats.downloads}\n  Link: ${app.status.source}\n`;
                });
                break;

            case 'info':
                return m.reply(`*${result.appInfo.label}*\n` +
                            `*\`Package:\`* ${result.appInfo.package}\n` +
                            `*\`Version:\`* ${result.appInfo.version.name} (Code: ${result.appInfo.version.code})\n` +
                            `*\`Size:\`* ${result.appInfo.size}\n` +
                            `*\`Downloads:\`* ${result.appInfo.downloads}\n` +
                            `*\`Description:\`* ${result.metadata.description?.slice(0, 100)}...\n\n> Application is being sent, please wait...`).then(_ => conn.sendFile(
                    m.chat,
                    result.download.link,
                    `${result.appInfo.package.split('.')[1]}.apk`,
                    `*${result.appInfo.label}*\nVersion: ${result.appInfo.version.name}\nSize: ${result.appInfo.size}`, m, false, { mimetype: 'application/vnd.android.package-archive', asDocument: true}));
                break;

            case 'profile':
                replyText = `*User Profile: ${result.name}*\n` +
                            `ID: ${result.userId}\n` +
                            `Joined: ${result.joinTime}\n` +
                            `Total Downloads: ${result.stats.totalDownloads}\n` +
                            `File Count: ${result.stats.filesCount}\n` +
                            `Status: ${result.status.isVerified ? 'Verified' : 'Not Verified'}\n`;
                break;

            case 'apps':
                replyText = `*Apps from profile*\nLink: ${result.profile_link}\nTotal: ${result.total}\n`;
                result.apps.forEach(app => {
                    replyText += `\n- *${app.appName}* (${app.package})\n  Version: ${app.version.name}\n  Size: ${app.metadata.size}\n  Downloads: ${app.stats.downloads}\n  Link: ${app.status.source}\n`;
                });
                break;
        }

        if (replyText) {
            await conn.reply(m.chat, replyText.trim(), m);
        }

    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, 'An internal error occurred.', m);
    }
};

handler.help = ['appteka'];
handler.command = ['appteka'];
handler.tags = ['downloader'];
handler.limit = true;
export default handler;
