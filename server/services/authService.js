const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../db/models');

const USER_ROLE_ID = 2;

const register = async ({ email, password, username, name, phone }) => {
  const isUserInBd = await User.findOne({
    where: { email: email.trim().toLowerCase() },
  });

  if (isUserInBd) {
    return { error: 'Пользователь с такой почтой уже зарегистрирован.' };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    email: email.trim().toLowerCase(),
    password: passwordHash,
    role_id: USER_ROLE_ID,
    username: username?.trim().toLowerCase() || null,
    name: name?.trim() || null,
    phone: phone?.trim() || null,
  });

  const plainUser = user.get({ plain: true });
  delete plainUser.password;

  const token = jwt.sign(
    { userId: plainUser.id, roleId: plainUser.role_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '3d'},
  );

  return { user: plainUser, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user) {
    return { error: 'Пользователь с такой почтой не зарегистрирован.' };
  }

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    return { error: 'Неправильные пароль или почта.' };
  }

  const plainUser = user.get 
    ? user.get({ plain: true })
    : user;

  delete plainUser.password;  

  const token = jwt.sign(
    { userId: user.id,  roleId: user.role_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '3d' },
  );

  return { user: plainUser, token };
}

module.exports = { login, register };

