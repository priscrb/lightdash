import { ApiError, ApiResponse, AuthorizationError } from '@lightdash/common';
import fetch, { BodyInit } from 'node-fetch';
import { URL } from 'url';
import { getConfig } from '../../config';

// should this get moved to common - very slightly modifed from the FE code
const handleError = (err: any): ApiError => {
    if (err.error?.statusCode && err.error?.name) return err;
    return {
        status: 'error',
        error: {
            name: 'NetworkError',
            statusCode: 500,
            message: `Could not connect to Lightdash server. The server may have crashed or be running on an incorrect host and port configuration.`,
            data: err,
        },
    };
};

type LightdashApiProps = {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
    url: string;
    body: BodyInit | undefined;
    verbose?: boolean;
};
export const lightdashApi = async <T extends ApiResponse['results']>({
    method,
    url,
    body,
    verbose,
}: LightdashApiProps): Promise<T> => {
    const config = await getConfig();
    if (!(config.context?.apiKey && config.context.serverUrl)) {
        throw new AuthorizationError(
            `Not logged in. Run 'lightdash login --help'`,
        );
    }

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `ApiKey ${config.context.apiKey}`,
    };
    const fullUrl = new URL(url, config.context.serverUrl).href;
    if (verbose) console.error(`> Making HTTP query to: ${fullUrl}`);

    return fetch(fullUrl, { method, headers, body })
        .then((r) => {
            if (!r.ok)
                return r.json().then((d) => {
                    throw d;
                });
            return r;
        })
        .then((r) => r.json())
        .then((d: ApiResponse | ApiError) => {
            if (verbose)
                console.error(`> HTTP request returned status: ${d.status}`);

            switch (d.status) {
                case 'ok':
                    return d.results as T;
                case 'error':
                    throw new Error(`${d}`);
                default:
                    throw new Error(`${d}`);
            }
        })
        .catch((err) => {
            const apiError = `${handleError(err).error}`;
            throw new Error(apiError);
        });
};
