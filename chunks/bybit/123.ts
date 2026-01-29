import axios from 'axios';
import * as crypto from 'crypto';
import * as qs from 'querystring';

const API_KEY = 'CE2BhOFHvQkTlawr5t';
const API_SECRET = '7PVmRxUleClqRl5cs0NLGKGpnhELDYqtL5sL';
const RECV_WINDOW = '30000';
const API_URL = 'https://api.bybit.com/v5/asset/coin/query-info';

interface BybitResponse {
    retCode: number;
    retMsg: string;
    result?: any;
}

async function getCoinInfo(): Promise<BybitResponse> {
    try {
        const timestamp = Date.now().toString();
        const params: Record<string, string> = {};

        const queryString = qs.stringify(params);

        const rawData = timestamp + API_KEY + RECV_WINDOW + queryString;
        const signature = crypto.createHmac('sha256', API_SECRET)
            .update(rawData)
            .digest('hex')
            .toLowerCase();

        const response = await axios.get(API_URL, {
            params,
            headers: {
                'X-BAPI-API-KEY': API_KEY,
                'X-BAPI-SIGN': signature,
                'X-BAPI-SIGN-TYPE': '2',
                'X-BAPI-TIMESTAMP': timestamp,
                'X-BAPI-RECV-WINDOW': RECV_WINDOW
            }
        });

        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        return { retCode: 500, retMsg: 'Request failed' };
    }
}

(async () => {
    try {
        const result = await getCoinInfo();

        if (result.retCode === 0) {
            console.log('Success:', result.result);
            
            require('fs').writeFileSync(
                './input-coins.json.json',
                JSON.stringify(result.result, null, 2)
            );
        } else {
            console.error('API Error:', result.retMsg);
        }
    } catch (error) {
        console.error('Critical error:', error);
    }
})();
