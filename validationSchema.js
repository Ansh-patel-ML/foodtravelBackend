const yup = require("yup");

const registerSchema = yup.object().shape({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  email: yup.string().email().required(),
  phoneNumber: yup.number().required(),
  address: yup.string().required(),
  city: yup.string().required(),
  password: yup.string().required(),
  country: yup.string().required(),
  state: yup.string().required(),
});

module.exports = registerSchema;
