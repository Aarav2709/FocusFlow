import path from 'node:path';
import { addAlias } from 'module-alias';

addAlias('@shared', path.join(__dirname, '../shared'));
