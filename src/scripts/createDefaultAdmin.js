const User = require("../models/user");
const { UserRole, AccountStatus } = require("../utils/enums");

async function createDefaultAdmin() {
  try {
    const adminExists = await User.findOne({ where: { role: UserRole.ADMIN } });
    
    if (!adminExists) {
      await User.create({
        firstName: "Super",
        lastName: "Admin",
        email: "admin@livo.com",
        phone: "123456789",
        password: "Admin123456",
        role: UserRole.ADMIN,
        accountStatus: AccountStatus.ACTIVE,
      });
      console.log("✅ Default admin created: admin@livo.com / Admin123456");
    }
  } catch (error) {
    console.error("Error creating default admin:", error.message);
  }
}

module.exports = createDefaultAdmin;