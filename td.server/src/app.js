import { expressCspHeader, NONE, SELF } from 'express-csp-header';

import express from 'express';
import path from 'path';
import rateLimit from 'express-rate-limit';

import env from './env/Env.js';
import envConfig from './config/env.config';
import expressHelper from './helpers/express.helper.js';
import https from './config/https.config.js';
import loggerHelper from './helpers/logger.helper.js';
import parsers from './config/parsers.config.js';
import routes from './config/routes.config.js';
import securityHeaders from './config/securityheaders.config.js';
import { upDir } from './helpers/path.helper.js';

const siteDir = path.join(__dirname, upDir, upDir, 'dist');
const docsDir = path.join(__dirname, upDir, upDir, 'docs');

// set up rate limiter: maximum of 6000 requests per 30 minute interval
const limiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 10 minutes
    max: 6000,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

const cspDirectives = {
    directives: {
        'default-src': [SELF],
        'frame-ancestors': [NONE],
        'form-action': [NONE],
        'script-src': [SELF],
        'style-src': [SELF],
        'img-src': [SELF],
        'worker-src': [NONE],
        'block-all-mixed-content': true
    }
};

const create = () => {
    let logger;

    try {
        envConfig.tryLoadDotEnv();
        // logging environment
        loggerHelper.level(env.get().config.LOG_LEVEL || 'info');
        logger = loggerHelper.get('app.js');

        const app = expressHelper.getInstance();
        app.set('trust proxy', true);
        // rate limiting only for production environemnts, otherwise automated e2e tests fail
        if (process.env.NODE_ENV !== 'development') {
            app.use(limiter);
        } else {
            logger.warn('Rate limiting disabled for development environments');
        }

        // security headers
        securityHeaders.config(app);

        // Force HTTPS in production
        app.use(https.middleware);
        app.use(expressCspHeader(cspDirectives));

        // static content
        app.use('/public', express.static(siteDir));
        app.use('/docs', express.static(docsDir));

        // parsers
        parsers.config(app);

        // routes
        routes.config(app);

        // if this default is changed then ensure docs are updated and CI pipeline still works
        app.set('port', env.get().config.PORT || 3000);
        logger.info('Express server listening on ' + app.get('port'));

        logger.info('OWASP Threat Dragon application started');
        return app;
    } catch (e) {
        if (!logger) { logger = console; }
        logger.error('OWASP Threat Dragon failed to start');
        logger.error(e.message);
        throw e;
    }
};

export default {
    create
};
