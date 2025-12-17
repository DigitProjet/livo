// src/utils/enums.js
const UserRole = {
    CLIENT: "CLIENT",
    MARCHANT: "MARCHANT",
    COURIER: "COURIER",
    ADMIN: "ADMIN",
  };
  
  const AccountStatus = {
    ACTIVE: "ACTIVE",
    SUSPENDED: "SUSPENDED",
    DELETED: "DELETED",
    PENDING: "PENDING",
  };
  
  module.exports = { UserRole, AccountStatus };
  

  const ProductCategory = {
    FOOD: "FOOD",
    DRINKS: "DRINKS",
    HYGIENE: "HYGIENE",
    SUPPLIES: "SUPPLIES",
    OTHER: "OTHER",
  };
  
  module.exports = {
    UserRole,
    AccountStatus,
    ProductCategory
  };
  