/* eslint-disable no-restricted-globals */
import Logger from './logger';
import models from '../models';
import { STATUS, MESSAGE } from './constants';


const { Op } = models.Sequelize;

let readTime;

export default {
  findArticleByAuthorId: async (authorId, title) => {
    try {
      const article = await models.Article.findOne({
        where: {
          title: { [Op.eq]: title },
          authorId: { [Op.eq]: authorId }
        }
      });
      if (article) return article.dataValues;
    } catch (error) {
      return error;
    }
  },
  createArticle: async (content) => {
    try {
      const article = await models.Article.create(content);
      return article;
    } catch (error) {
      return error;
    }
  },
  articleReadTime: (articleBody) => {
    try {
      const defaultArticleLength = 250;
      const articleLength = articleBody.body.split(' ').length;
      if (articleLength <= defaultArticleLength) {
        readTime = '1 minute read';
        return readTime;
      }
      readTime = Math.round(articleLength / defaultArticleLength);
      if (readTime === 1) {
        return `${readTime} minute read`;
      }
      return `${readTime} minutes read`;
    } catch (err) {
      return err;
    }
  },
  findArticleCategory: async (res, categoryId) => {
    try {
      const categoryFound = await models.ArticleCategory.findOne({
        where: {
          id: categoryId
        }
      });
      if (categoryFound) {
        return categoryFound.dataValues;
      }
    } catch (err) {
      Logger.log(err.message);
    }
  },
  getResourcesAsPages: (req, articles) => {
    const {
      offset, limit, current
    } = req.body;

    const last = Math.ceil(articles.count / limit);
    const currentCount = articles.rows.length;
    let result = {
      code: STATUS.NOT_FOUND, data: [], message: MESSAGE.ARTICLES_NOT_FOUND, status: false
    };
    if (currentCount !== 0) {
      result = {
        code: STATUS.OK,
        data: {
          articles: articles.rows,
          page: {
            first: 1,
            current,
            last,
            currentCount,
            totalCount: articles.count,
            description: `${offset + 1}-${offset + currentCount} of ${articles.count}`
          }
        },
        message: MESSAGE.ARTICLES_FOUND,
        status: true,
      };
    }
    return result;
  },
  /**
   * Formats the query parameters into a sequelize readable object for search and filtering data
   * @static
   * @param {object} query An object containing the search terms
   * @returns {object} The sequalize formated query
   */
  formatSearchQuery: (query) => {
    const {
      author, tag, q, categoryId
    } = query;

    const authorQuery = author ? {
      [Op.or]: {
        '$User.Profile.username$': {
          [Op.iLike]: `%${author}%`,
        },
        '$User.Profile.firstname$': {
          [Op.iLike]: `%${author}%`,
        },
        '$User.Profile.lastname$': {
          [Op.iLike]: `%${author}%`,
        },
      }
    } : {};

    const titleQuery = q ? {
      [Op.or]: {
        title: {
          [Op.iLike]: `%${q}%`,
        },
        description: {
          [Op.iLike]: `%${q}%`,
        },
      },
    } : {};

    const tagQuery = tag ? {
      tagName: {
        [Op.iLike]: `%${tag}%`,
      }
    } : {};

    const categoryQuery = categoryId ? {
      id: {
        [Op.eq]: parseInt(categoryId, 10),
      }
    } : {};
    return {
      categoryQuery, authorQuery, tagQuery, titleQuery
    };
  },
};
