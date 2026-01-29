import { TwitterApi } from 'twitter-api-v2';
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}] ${message}`)
    ),
    transports: [new transports.Console()]
});

const BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAAGQ4zgEAAAAApSwY24rsA%2F%2BZ5S0qQLJtdLtSOyI%3DZKfhYhQB7djHQXBzBQXfYmKJa5c6s9xyAsa2qc8VSKjVVuD8u8';
const API_KEY = 'qVYwZ4HqoJahIqDdd0VkMzuby';
const API_SECRET = '28fyR9iGo2q8jiI9p5qkfkxW8pSo8P4JbSmSFBSCQglvTOmpdv';
const ACCESS_TOKEN = '1879136799483744256-tlmd7iEMJoEvBrMfslLeU7X6OgtiLM';
const ACCESS_TOKEN_SECRET = 'mhapbUbolaiWUoH1DstT6ox06nAM3k0imQzDUAAj2xvQK';

const TRACKED_USER_NAME = 'kanyewest';
const YOUR_CONTRACT = '0x23d3f4eaaa515403c6765bb623f287a8cca28f2b';

const CONTRACT_PATTERN = /\b0x[a-fA-F0-9]{40}\b/g;

async function getUserId(client: TwitterApi, username: string): Promise<string | null> {
    logger.info('Получение user_id...');
    try {
        const user = await client.v2.userByUsername(username);
        logger.info(`user_id: ${user.data.id}`);
        return user.data.id;
    } catch (error) {
        logger.error(`Ошибка получения user_id: ${error}`);
        return null;
    }
}

async function main() {
    try {
        logger.info('Инициализация клиентов...');

        const clientV2 = new TwitterApi(BEARER_TOKEN);
        const clientV1 = new TwitterApi({
            appKey: API_KEY,
            appSecret: API_SECRET,
            accessToken: ACCESS_TOKEN,
            accessSecret: ACCESS_TOKEN_SECRET,
        });

        const userId = await getUserId(clientV1, TRACKED_USER_NAME);
        if (!userId) {
            throw new Error('Пользователь не найден');
        }

        const stream = await clientV2.v2.searchStream({ expansions: ['author_id'] });
        logger.info('Стрим запущен...');

        for await (const { data } of stream) {
            if (data.author_id === userId) {
                logger.info(`Новый твит: ${data.id}`);
                const addresses = data.text.match(CONTRACT_PATTERN) || [];

                if (addresses.length > 0) {
                    logger.info(`Найдены адреса: ${addresses}`);
                    for (const addr of addresses) {
                        if (addr.toLowerCase() === YOUR_CONTRACT.toLowerCase()) {
                            logger.warn(`🚨 Совпадение в твите: https://twitter.com/${TRACKED_USER_NAME}/status/${data.id}`);
                        } else {
                            logger.info(`Адрес не совпадает: ${addr}`);
                        }
                    }
                } else {
                    logger.info('Адреса не найдены');
                }
            }
        }
    } catch (error) {
        logger.error(`Критическая ошибка: ${error}`);
    }
}

main();
