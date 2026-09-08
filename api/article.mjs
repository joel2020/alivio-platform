import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { renderArticle } from '../.server/entry-article.js';
import { createArticleHandler } from '../server/article-handler.mjs';

export default createArticleHandler({
  renderArticle,
  readTemplate: () => readFile(resolve('.server/article-template.html'), 'utf8'),
});
