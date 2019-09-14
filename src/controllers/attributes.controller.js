import { Attribute, AttributeValue } from '../database/models';

/**
 * The controller defined below is the attribute controller, highlighted below are the functions of each static method
 * in the controller
 *  Some methods needs to be implemented from scratch while others may contain one or two bugs
 *
 * - getAllAttributes - This method should return an array of all attributes
 * - getSingleAttribute - This method should return a single attribute using the attribute_id in the request parameter
 * - getAttributeValues - This method should return an array of all attribute values of a single attribute using the attribute id
 * - getProductAttributes - This method should return an array of all the product attributes
 * NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */
class AttributeController {
  /**
   * This method get all attributes
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {function} next next middleware
   * @returns {json} json object with attributes list
   * @memberof AttributeController
   */
  static async getAllAttributes(req, res, next) {
    try {
      const attributes = await Attribute.findAll();
      return res.status(200).json(attributes);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method gets a single attribute using the attribute id
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {function} next next middleware
   * @returns {json} json object with single attribute
   * @memberof AttributeController
   */
  static async getSingleAttribute(req, res, next) {
    const { attribute_id: attributeId } = req.params;
    try {
      const attribute = await Attribute.findByPk(attributeId);
      if (attribute) {
        return res.status(200).json(attribute);
      }
      return res.status(404).json({
        error: {
          status: 404,
          message: `Attribute with id ${attributeId} does not exist`,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method gets a list attribute values in an attribute using the attribute id
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {function} next next middleware
   * @returns {json} json object with a single attributes values
   * @memberof AttributeController
   */
  static async getAttributeValues(req, res, next) {
    const { attribute_id: attributeId } = req.params;
    try {
      const attributeValues = await Attribute.findByPk(attributeId, {
        include: [
          {
            model: AttributeValue,
            attributes: ['value', 'attribute_value_id'],
          },
        ],
      });

      if (attributeValues) {
        const { AttributeValues } = attributeValues;
        return res.status(200).json(AttributeValues);
      }

      return res.status(404).json({
        error: {
          status: 404,
          message: `Attribute with id ${attributeId} does not exist`,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method gets a list attribute values in a product using the product id
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getProductAttributes(req, res, next) {
    // Write code to get all attribute values for a product using the product id provided in the request param
    return res.status(200).json({ message: 'this works' });
  }
}

export default AttributeController;
