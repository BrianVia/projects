import { Router } from 'express';
import * as cors from 'cors';
import { DomainsController } from './controller';
import { Logger } from '@common/logger';

const logger = new Logger();

const domainController = new DomainsController();

export const domainRouter = Router().use(cors());

domainRouter.get(`/`, domainController.handleDomainsGet);
