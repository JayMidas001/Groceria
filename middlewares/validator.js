const validator = require('@hapi/joi')

const schemas = {
    
    businessName:validator.string().min(6).required().pattern(new RegExp(/^[^\s].+[^\s]$/)).messages({
        "any.required": "Business name is required.",
        "string.empty": "Business name cannot be empty.",
        "string.min": "Business name must be at least 6 characters long.",
        "string.pattern.base": "Business name cannot start or end with a whitespace.",
        "string.base": "Business name cannot be empty."
      }),
      fullName: validator.string()
      .min(6)
      .custom(value => value.trim())
      .pattern(new RegExp("^[A-Za-z]+(\\s+[A-Za-z]+)+$"))
      .required()
      .messages({
        "any.required": "Full name is required.",
        "string.empty": "Full name cannot be empty.",
        "string.min": "Full name must be at least 6 characters long.",
        "string.pattern.base": "Please provide both first and last names separated by a space.",
        "string.base": "Full name cannot be empty."
      }),
    customerFirstName: validator.string()
    .min(3)
    .custom(value => value.trim())  // Trim leading and trailing whitespace
    .pattern(new RegExp("^[A-Za-z]+$"))  // Ensure only alphabetic characters are allowed
    .required()
    .messages({
      "any.required": "First name is required.",
      "string.empty": "First name cannot be empty.",
      "string.min": "First name must be at least 6 characters long.",
      "string.pattern.base": "First name must contain only alphabetic characters.",
      "string.base": "First name cannot be empty."
    }),
    customerLastName: validator.string()
    .min(3)
    .custom(value => value.trim())  // Trim leading and trailing whitespace
    .pattern(new RegExp("^[A-Za-z]+$"))  // Ensure only alphabetic characters are allowed
    .required()
    .messages({
      "any.required": "First name is required.",
      "string.empty": "First name cannot be empty.",
      "string.min": "First name must be at least 6 characters long.",
      "string.pattern.base": "First name must contain only alphabetic characters.",
      "string.base": "First name cannot be empty."
    }),
    email:validator.string().email().required().messages({
        "any.required": "Email is required.",
        "string.email": "Invalid email format.",
        "string.base": "Email cannot be empty.",
        "string.pattern.base": "Email cannot be empty."
      }),
    phoneNumber:validator.string()
    .length(11)
    .pattern(/^\d+$/)
    .required()
    .messages({
      "any.required": "Phone number is required.",
      "string.length": "Phone number must be exactly 11 digits.",
      "string.pattern.base": "Phone number must contain only numeric digits.",
      "string.base": "Phone number cannot be empty."
      }),
    customerPhoneNumber:validator.string()
    .length(11)
    .pattern(/^\d+$/)
    .required()
    .messages({
      "any.required": "Phone number is required.",
      "string.length": "Phone number must be exactly 11 digits.",
      "string.pattern.base": "Phone number must contain only numeric digits.",
      "string.base": "Phone number cannot be empty."
      }),
    password:validator.string()
    .pattern(new RegExp("^(?=.*[!@#$%^&*.])(?=.*[A-Z]).{8,}$"))
    .required()
    .messages({
      "any.required": "Password is required.",
      "string.base": "Password must contain at least 8 characters, one capital letter, and one special character (!@#$%^&*.).",
      "string.pattern.base":
      "Password must contain at least 8 characters, one capital letter, and one special character (!@#$%^&*.).",}),
    address:validator.string().required().regex(/^[a-zA-Z0-9-,\. ]+$/).messages({
        'string.pattern.base': 'Address can contain only alphabetic characters, numbers, spaces, or punctuations.',
        'any.required': 'Address is required.',
        'string.empty': 'Address cannot be empty.',
        "string.base": "Address cannot be empty."
      }),
    customerAddress:validator.string().required().regex(/^[a-zA-Z0-9-,\. ]+$/).messages({
        'string.pattern.base': 'Address can contain only alphabetic characters, numbers, spaces, or punctuations.',
        'any.required': 'Address is required.',
        'string.empty': 'Address cannot be empty.',
        "string.base": "Address cannot be empty."
      }),
    newPassword:validator.string()
    .pattern(new RegExp("^(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$"))
    .messages({
      "string.pattern.base":
        "New password must contain at least 8 characters, one capital letter, and one special character (!@#$%^&*).",
        "string.base": "Password must contain at least 8 characters, one capital letter, and one special character (!@#$%^&*.).",
      }),
    existingPassword:validator.string()
    .pattern(new RegExp("^(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$"))
    .messages({
      "string.pattern.base":
        "Existing password must contain at least 8 characters, one capital letter, and one special character (!@#$%^&*).",
        "string.base": "Password must contain at least 8 characters, one capital letter, and one special character (!@#$%^&*.).",
      }),
    description:validator.string()
    .pattern(/^[a-zA-Z0-9\s.,!?'"()&%$#@*-]{1,400}$/, 'store description')
    .max(400)
    .required()
    .messages({
      'string.base': 'Store description must be a string.',
      'string.pattern.name': 'Store description can only contain letters, numbers, spaces, and common punctuation marks.',
      'string.max': 'Store description cannot exceed 400 characters.',
      'any.required': 'Store description is required.',
    }),
    city: validator.string()
    .custom(value => value.trim())  // Trim leading and trailing whitespace
    .pattern(new RegExp("^[A-Za-z]+(\\s[A-Za-z]+)?$"))  // Allow one or two words separated by a single space
    .required()
    .messages({
      "any.required": "City is required.",
      "string.empty": "City cannot be empty.",
      "string.pattern.base": "City can only contain one or two words with alphabetic characters.",
      "string.base": "City cannot be empty."
    })

}

const midasValidator = (validateAllFields = false) => {
  return async (req, res, next) => {
      const keysToValidate = {};

      if (validateAllFields) {
          Object.keys(schemas).forEach((key) => {
              keysToValidate[key] = schemas[key].required();
          });
      } else {
          Object.keys(req.body).forEach((key) => {
              if (schemas[key]) {
                  keysToValidate[key] = schemas[key];
              }
          });
      }
      const schema = validator.object(keysToValidate);

      const { error } = schema.validate(req.body);

      if (error) {
          return res.status(400).json(error.details[0].message);
      } else {
          return next();
      }
  };
}

module.exports = midasValidator