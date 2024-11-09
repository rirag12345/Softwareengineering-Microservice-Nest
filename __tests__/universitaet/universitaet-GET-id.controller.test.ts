import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { HttpStatus } from '@nestjs/common';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { UniversitaetModel } from '../../src/universitaet/controller/universitaet-get.controller.js';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import type { ErrorResponse } from './error-response.js';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const idVorhanden = '1';
const idNichtVorhanden = '9999999999';
// const idVorhandenETag = '1';
const idFalsch = 'abc';

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// Test-Suite
// eslint-disable-next-line max-lines-per-function
describe('GET /rest/:id', () => {
    let client: AxiosInstance;

    // Testserver starten und dabei mit der DB verbinden
    beforeAll(async () => {
        await startServer();
        const baseURL = `https://${host}:${port}/rest`;
        client = axios.create({
            baseURL,
            httpsAgent,
            validateStatus: (status) => status < 500, // eslint-disable-line @typescript-eslint/no-magic-numbers
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test(`Universitaet zu vorhandener Id`, async () => {
        // given
        const url = `/${idVorhanden}`;

        // when
        const { status, headers, data }: AxiosResponse<UniversitaetModel> =
            await client.get(url);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);

        // eslint-disable-next-line no-underscore-dangle
        const selfLink = data._links.self.href;

        // https://jestjs.io/docs/next/snapshot-testing
        // https://medium.com/swlh/easy-integration-testing-of-graphql-apis-with-jest-63288d0ad8d7
        expect(selfLink).toMatchSnapshot();
    });

    test(`Keine Universitaet zu nicht vorhandener Id`, async () => {
        // given
        const url = `/${idNichtVorhanden}`;

        // when
        const { status, data }: AxiosResponse<ErrorResponse> =
            await client.get(url);

        const { error, message } = data;

        // then
        expect(error).toBe(`Not Found`);
        expect(message).toEqual(expect.stringContaining(message));
        expect(status).toBe(HttpStatus.NOT_FOUND);
    });

    test(`Keine Universitaet zu falscher Id`, async () => {
        // given
        const url = `/${idFalsch}`;

        // when
        const { status, data }: AxiosResponse<ErrorResponse> =
            await client.get(url);

        const { error } = data;

        expect(error).toBe(`Not Found`);
        expect(status).toBe(HttpStatus.NOT_FOUND);
    });
});