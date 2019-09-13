import { Tax } from '../database/models';

/**
 * Tax controller contains methods which are needed for all tax request
 * Implement the functionality for the methods
 *
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */
class TaxController {
  /**
   * This method get all taxes
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {function} next next middleware
   * @returns {json} json object with a list of taxes
   * @memberof TaxController
   */
  static async getAllTax(req, res, next) {
    try {
      const taxes = await Tax.findAll();
      return res.status(200).json(taxes);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method gets a single tax using the tax id
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {function} next next middleware
   * @returns {json} json object with a details of a single tax
   * @memberof TaxController
   */
  static async getSingleTax(req, res, next) {
    const { tax_id: taxId } = req.params;
    try {
      const tax = await Tax.findByPk(taxId);
      if (tax) {
        return res.status(200).json(tax);
      }
      return res.status(404).json({
        error: {
          status: 404,
          message: `Tax with id ${taxId} does not exist`,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default TaxController;
