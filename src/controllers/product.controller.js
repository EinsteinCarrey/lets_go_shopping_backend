/**
 * The Product controller contains all static methods that handles product request
 * Some methods work fine, some needs to be implemented from scratch while others may contain one or two bugs
 * The static methods and their function include:
 *
 * - getAllProducts - Return a paginated list of products
 * - searchProducts - Returns a list of product that matches the search query string
 * - getProductsByCategory - Returns all products in a product category
 * - getProductsByDepartment - Returns a list of products in a particular department
 * - getProduct - Returns a single product with a matched id in the request params
 * - getAllDepartments - Returns a list of all product departments
 * - getDepartment - Returns a single department
 * - getAllCategories - Returns all categories
 * - getSingleCategory - Returns a single category
 * - getDepartmentCategories - Returns all categories in a department
 *
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */
import {
  Product,
  ProductCategory,
  Department,
  Category,
  Sequelize,
  sequelize,
} from '../database/models';

const { Op } = Sequelize;

const productsQueryMap = {
  attributes: ['product_id', 'name', 'price', 'thumbnail', 'discounted_price', 'description'],
};

/**
 *
 *
 * @class ProductController
 */
class ProductController {
  /**
   * get all products
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {function} next next middleware
   * @returns {json} json object with status, paginationMeta and product data
   * @memberof ProductController
   */
  static async getAllProducts(req, res, next) {
    const { query } = req;
    const { description_length: descriptionLength } = query;
    let { page, limit } = query;
    limit = limit || 20;
    page = page || 1;

    // eslint-disable-next-line no-restricted-globals
    if (isNaN(page) || isNaN(limit) || isNaN(descriptionLength)) {
      return res.status(400).json({
        err: 'Query parameters should be valid integer values',
        status: false,
      });
    }

    const sqlQueryMap = Object.assign({}, productsQueryMap);

    sqlQueryMap.limit = parseInt(limit, 10);
    sqlQueryMap.offset = (page - 1) * limit;
    sqlQueryMap.attributes.push(
      // substring description at number of characters defined by `descriptionLength`
      sequelize.literal(`SUBSTRING(description, 1, ${descriptionLength}) as description`)
    );

    try {
      const products = await Product.findAndCountAll(sqlQueryMap);
      const { rows, count } = products;

      const paginationMeta = {
        currentPage: parseInt(page, 10),
        currentPageSize: parseInt(limit, 10),
        totalPages: Math.ceil(count / limit),
        totalRecords: count,
      };

      return res.status(200).json({
        paginationMeta,
        rows,
        status: true,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * search all products
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {function} next next middleware
   * @returns {json} json object with product data
   * @memberof ProductController
   */
  static async searchProduct(req, res, next) {
    const { query } = req;
    const {
      query_string: queryString,
      all_words: allWords,
      description_length: descriptionLength = 200,
    } = query;

    // noinspection DuplicatedCode
    let { page, limit } = query;
    limit = limit || 20;
    page = page || 1;

    // eslint-disable-next-line no-restricted-globals
    if (isNaN(page) || isNaN(limit) || isNaN(descriptionLength)) {
      return res.status(400).json({
        err: 'Query parameters should be valid integer values',
        status: false,
      });
    }
    const sqlQueryMap = Object.assign({}, productsQueryMap);
    const { attributes } = sqlQueryMap;

    // substring description at number of characters defined by `descriptionLength`
    sqlQueryMap.attributes = attributes.concat([
      sequelize.literal(`SUBSTRING(description, 1, ${descriptionLength || 200}) as description`),
    ]);

    const searchParam =
      allWords === 'on' ? { [Op.eq]: `${queryString}` } : { [Op.substring]: `${queryString}` };

    sqlQueryMap.where = { name: searchParam };
    sqlQueryMap.limit = parseInt(limit, 10);
    sqlQueryMap.offset = (page - 1) * limit;

    try {
      const product = await Product.findAll(sqlQueryMap);

      return res.status(200).json(product);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all products by caetgory
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {function} next next middleware
   * @returns {json} json object with products listed by category
   * @memberof ProductController
   */
  static async getProductsByCategory(req, res, next) {
    try {
      const { category_id } = req.params; // eslint-disable-line
      const { description_length: descriptionLength = 200, page = 1, limit = 20 } = req.query;

      // eslint-disable-next-line no-restricted-globals
      if (isNaN(page) || isNaN(limit) || isNaN(descriptionLength)) {
        return res.status(400).json({
          err: 'Query parameters should be valid integer values',
          status: false,
        });
      }

      const offset = ((page || 1) - 1) * (limit || 20);
      const queryMap = {
        limit: limit ? parseInt(limit, 10) : 20,
        offset,
        where: { category_id },
        include: [
          {
            model: Product,
            as: 'product',
            attributes: [
              ...productsQueryMap.attributes,
              // substring description at number of characters defined by `descriptionLength`
              sequelize.literal(
                `SUBSTRING(description, 1, ${descriptionLength || 200}) as description`
              ),
            ],
          },
        ],
      };

      const products = await ProductCategory.findAll(queryMap);
      const rows = products.map(x => x.product);
      return res.status(200).json({ rows });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all products by department
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {function} next next middleware
   * @returns {json} json object with list of product filtered by department
   * @memberof ProductController
   */
  static async getProductsByDepartment(req, res, next) {
    try {
      const { department_id } = req.params; // eslint-disable-line
      const { description_length: descriptionLength = 200, page = 1, limit = 20 } = req.query;

      // eslint-disable-next-line no-restricted-globals
      if (isNaN(page) || isNaN(limit) || isNaN(descriptionLength)) {
        return res.status(400).json({
          err: 'Query parameters should be valid integer values',
          status: false,
        });
      }

      const offset = ((page || 1) - 1) * (limit || 20);
      const queryMap = {
        limit: limit ? parseInt(limit, 10) : 20,
        offset,
        attributes: [],
        include: [
          {
            model: Category,
            where: { department_id },
            attributes: [],
          },
          {
            model: Product,
            as: 'product',
            attributes: [
              ...productsQueryMap.attributes,
              // substring description at number of characters defined by `descriptionLength`
              sequelize.literal(
                `SUBSTRING(product.description, 1, ${descriptionLength || 200}) as description`
              ),
            ],
          },
        ],
      };

      const products = await ProductCategory.findAll(queryMap);
      const rows = products.map(x => x.product);
      return res.status(200).json({ rows });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get single product details
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {function} next next middleware
   * @returns {json} json object with a single products details
   * @memberof ProductController
   */
  static async getProduct(req, res, next) {
    const {
      query: { description_length: descriptionLength = 200 },
      params: { product_id: productId },
    } = req;

    // eslint-disable-next-line no-restricted-globals
    if (isNaN(descriptionLength)) {
      return res.status(400).json({
        err: 'description_length should be valid integer values',
        status: false,
      });
    }

    const sqlQueryMap = Object.assign({}, productsQueryMap);
    const { attributes } = sqlQueryMap;

    sqlQueryMap.attributes = attributes.concat([
      'image',
      'display',
      'image_2',
      // substring description at number of characters defined by `descriptionLength`
      sequelize.literal(`SUBSTRING(description, 1, ${descriptionLength}) as description`),
    ]);

    try {
      const product = await Product.findByPk(productId, sqlQueryMap);

      if (product) {
        return res.status(200).json(product);
      }

      return res.status(404).json({
        error: {
          status: 404,
          message: `Product with id ${productId} does not exist`,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all departments
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {function} next next middleware
   * @returns {json} json object with status and department list
   * @memberof ProductController
   */
  static async getAllDepartments(req, res, next) {
    try {
      const departments = await Department.findAll();
      return res.status(200).json(departments);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get a single department
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getDepartment(req, res, next) {
    const { department_id: departmentId } = req.params;
    try {
      const department = await Department.findByPk(departmentId);
      if (department) {
        return res.status(200).json(department);
      }
      return res.status(404).json({
        error: {
          status: 404,
          message: `Department with id ${departmentId} does not exist`,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method should get all categories
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {function} next next middleware
   * @returns {json} json object with status and category list
   * @memberof ProductController
   */
  static async getAllCategories(req, res, next) {
    try {
      const categories = await Category.findAll();
      return res.status(200).json({ rows: categories });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method should get a single category using the categoryId
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {function} next next middleware
   * @returns {json} json object with single category
   * @memberof ProductController
   */
  static async getSingleCategory(req, res, next) {
    const { category_id: categoryId } = req.params;
    try {
      const category = await Category.findByPk(categoryId);
      if (category) {
        return res.status(200).json(category);
      }
      return res.status(404).json({
        error: {
          status: 404,
          message: `Category with id ${categoryId} does not exist`,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method should get list of categories in a department
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {function} next next middleware
   * @returns {json} json object with list of categories filtered by department_id
   * @memberof ProductController
   */
  static async getDepartmentCategories(req, res, next) {
    const queryMap = {
      where: {
        department_id: req.params.department_id,
      },
    };
    try {
      const categories = await Category.findAll(queryMap);
      return res.status(200).json({ rows: categories });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method should get the category of a product
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {function} next next middleware
   * @returns {json} json object with category of a product
   * @memberof ProductController
   */
  static async getProductCategories(req, res, next) {
    try {
      const queryMap = {
        attributes: [],
        where: {
          product_id: req.params.product_id,
        },
        include: [
          {
            model: Category,
            attributes: ['name', 'category_id', 'department_id'],
          },
        ],
      };

      const categories = await ProductCategory.findAll(queryMap);

      if (categories.length > 0) {
        return res.status(200).json(categories[0].Category);
      }
      return res.status(404).json({
        error: {
          status: 404,
          message: `Category not found`,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default ProductController;
