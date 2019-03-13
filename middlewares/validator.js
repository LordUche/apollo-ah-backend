import { body } from 'express-validator/check';
import { MESSAGE, FIELD } from '../helpers/constants';
import UsersController from '../controllers/usersController';
import ProfileController from '../controllers/profileController';
/**
 * Used with express validator to validate input paramters
 * @export
 * @class Validator
 */
export default class Validator {
  /**
   * Validates registration/signup parameters
   * @static
   * @returns {array} The array of express validator chains
   * @memberof Validator
   */
  static validateRegistration() {
    return [
      ...Validator.validateEmail(),
      ...Validator.verifyEmailExists(),
      ...Validator.validatePassword(),
      ...Validator.validateUsername()
    ];
  }

  /**
   * Validates email when recovering password
   * @static
   * @returns {array} The array of express validator chains
   * @memberof Validator
   */
  static validateForgotPassword() {
    return [
      ...Validator.validateEmail(),
      ...Validator.verifyEmailExists(true),
    ];
  }

  /**
   * Validate password and confirm_password parameters when reseting a user password
   * @static
   * @memberof Validator
   * @returns {void}
   */
  static validateResetPassword() {
    return [
      body(FIELD.PASSWORD)
        .not().isEmpty()
        .withMessage(MESSAGE.PASSWORD_EMPTY),
      body(FIELD.CONFIRM_PASSWORD)
        .not().isEmpty()
        .withMessage(MESSAGE.CONFIRM_PASSWORD_EMPTY)
        .custom((password, { req }) => {
          if (password !== req.body.password) {
            throw new Error(MESSAGE.PASSWORD_NOT_MATCH);
          } else {
            return password;
          }
        })
    ];
  }

  /**
   * Validates password
   * @static
   * @returns {array} The array of express validator chains
   * @memberof Validator
   */
  static validatePassword() {
    return [
      body(FIELD.PASSWORD)
        .not().isEmpty()
        .withMessage(MESSAGE.PASSWORD_EMPTY)
        .isLength({ min: 8 })
        .withMessage(MESSAGE.PASSWORD_TOO_SHORT)
        .matches(/[a-z]/i)
        .withMessage(MESSAGE.PASSWORD_NOT_ALPHANUMERIC)
        .matches(/\d/)
        .withMessage(MESSAGE.PASSWORD_NOT_ALPHANUMERIC)
    ];
  }

  /**
   * Validates username
   * @static
   * @returns {array} The array of express validator chains
   * @memberof Validator
   */
  static validateUsername() {
    return [
      body(FIELD.USERNAME)
        .trim()
        .not().isEmpty()
        .withMessage(MESSAGE.USERNAME_EMPTY)
        .custom(async (username) => {
          if (await ProfileController.usernameExists(username.toLowerCase())) {
            return Promise.reject(MESSAGE.USERNAME_EXITS);
          }
        }),
    ];
  }

  /**
   * Validates email
   * @static
   * @returns {array} The array of express validator chains
   * @memberof Validator
   */
  static validateEmail() {
    return [
      body(FIELD.EMAIL)
        .trim()
        .not().isEmpty()
        .withMessage(MESSAGE.EMAIL_EMPTY)
        .isEmail()
        .withMessage(MESSAGE.EMAIL_INVALID),
    ];
  }

  /**
   * Verifies that the email exists
   * @static
   * @returns {array} The array of express validator chains
   * @param {boolean} alternate Alternate the response message
   * @memberof Validator
   */
  static verifyEmailExists(alternate = false) {
    return [
      body(FIELD.EMAIL)
        .trim()
        .custom(async (email) => {
          const user = await UsersController.getUser('email', email);
          if (!alternate && user) {
            return Promise.reject(MESSAGE.EMAIL_EXISTS);
          }
          if (alternate && !user) {
            return Promise.reject(MESSAGE.EMAIL_NOT_EXISTS);
          }
        }),
    ];
  }
}
