// Payment methods with dummy account details for demonstration
const PAYMENT_METHODS = {
  EasyPaisa: {
    name: 'EasyPaisa',
    accountNumber: '03001234567',
    accountHolder: 'IIT LMS Institute',
    instructions: 'Send payment to this EasyPaisa account number and upload the transaction receipt as proof.',
    color: 'blue'
  },
  JazzCash: {
    name: 'JazzCash',
    accountNumber: '03007654321',
    accountHolder: 'IIT LMS Institute',
    instructions: 'Send payment to this JazzCash account number and upload the transaction receipt as proof.',
    color: 'purple'
  },
  'Bank Account': {
    name: 'Bank Account',
    accountNumber: 'PK36SCBL1234567890123456',
    accountHolder: 'IIT LMS Institute',
    bankName: 'Standard Chartered Bank',
    branchCode: '1234',
    instructions: 'Transfer funds to this bank account and upload the bank receipt or transaction confirmation as proof.',
    color: 'green'
  }
};

const getPaymentMethodDetails = (methodName) => {
  return PAYMENT_METHODS[methodName] || null;
};

const getAllPaymentMethods = () => {
  return Object.values(PAYMENT_METHODS);
};

const getPaymentMethodNames = () => {
  return Object.keys(PAYMENT_METHODS);
};

module.exports = {
  PAYMENT_METHODS,
  getPaymentMethodDetails,
  getAllPaymentMethods,
  getPaymentMethodNames
};
